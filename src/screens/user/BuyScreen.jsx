import { StyleSheet, Text, View, Button, TextInput, Alert } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthToken } from "../../config/axios";
// import usePortfolioStore from "./store/store";

const BuyScreen = ({ navigation, route }) => {
  const { stock } = route.params;
  console.log(stock)
//   const buyStock = usePortfolioStore((state) => state.buyStock);

  //stocks quantity
  const [quantity, setQuantity] = useState("1");
  const [totalPrice, setTotalPrice] = useState(0);

  //saving buying details into DB
  const handleBuyStockRequest = async() =>{
    // console.log("function called")
    const token = await getAuthToken();
    // console.log(token,"Token");

    if(!token)
    {
      console.log("no token found")
    }
    try {      
      console.log("Sending request to backend...");

      const res = await fetch(`http://192.168.56.1:5000/api/portfolio/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          quantity: Number(quantity),
          companyName: stock.symbol,
        }),
      });

      console.log("Response status:", res.status);

      // Try to read JSON response safely
      const responseData = await res.json();
      // console.log("Response data:", responseData);

      if (!res.ok) {
        console.error("Error inserting data:", responseData.message);
      } else {
        console.log("Data inserted successfully:", responseData);
      }
    } catch (error) {
      console.error("Network error:", error.message);
    }

}

  const handleCalculatePrice = () => {
    const qty = parseInt(quantity) || 0;

    if (qty == 0) {
      Alert.alert("Enter valid quantity.");
    }
    setTotalPrice(qty * stock.price);
  };

  const handleBuy = async() => {
    const availableBal = 10000;
    const remainingBal = availableBal - totalPrice;

    if (remainingBal >= 0) {
      Alert.alert(
        `You have bought ${quantity} stocks of ${stock.symbol} worth : ${totalPrice}`
      );
      // availableBal -= remainingBal;

      handleBuyStockRequest();
      setQuantity("");

      //saving the bought stock deatails in localStoreage
      const newTransection ={
        symbol:stock.symbol,
        quantity:quantity,
        timestamp:new Date(),
        total:stock.price * Number(quantity),
        type:"Bought"
      }

      // Retrieve previous transactions
    const storedTransactions = await AsyncStorage.getItem("transections");
    let transactions = storedTransactions ? JSON.parse(storedTransactions) : [];

    // Ensure transactions is an array
    if (!Array.isArray(transactions)) {
      transactions = [];
    }

      //if transections have already 5 object the remoce last 
      if(transactions.length >= 5)
      {
        transactions.pop();
      }

      //save nee recent transection to transections array
      transactions.unshift(newTransection);

      //update AsyncStorage
      await AsyncStorage.setItem("transections", JSON.stringify(transactions));

      navigation.goBack();
    } else {
      Alert.alert("Not sufficient balance.");
    }
  };


  return (
    // <GestureHandlerRootView>
    <View style={styles.container}>
      <Text style={styles.companyName}>{stock.symbol} - Buy stocks</Text>
      <Text style={styles.stockCurrentPrice}>
        current price : {stock.price}
      </Text>

      <Text style={styles.text}>Quantity:</Text>
      <TextInput
        style={styles.stockQuantityInput}
        placeholder="Enter stocks quantity"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <Button title="Calculate Price" onPress={handleCalculatePrice}></Button>
      {totalPrice ? (
        <Text style={styles.totalPrice}>Total price:{totalPrice}</Text>
      ) : null}

      <View style={styles.confirmBuyBtn}>
        <Button title="Confirm Buy" onPress={handleBuy}></Button>
      </View>
    </View>
    // </GestureHandlerRootView>
  );
};

export default BuyScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },

  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "start",
    marginTop: 20,
  },

  stockCurrentPrice: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 400,
    fontFamily: "arial",
    marginBottom: 15,
    marginLeft: 1,
  },

  stockQuantityInput: {
    marginVertical: 5,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
  },

  text: {
    fontSize: 18,
    fontWeight: "bold",
  },

  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },

  confirmBuyBtn: {
    backgroundColor: "green",
    color: "white",
    marginTop: 20,
  },
});
