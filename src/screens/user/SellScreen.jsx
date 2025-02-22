import { StyleSheet, Text, View, Button, TextInput, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { getAuthToken } from "../../config/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SellScreen = ({ navigation, route }) => {
  const { stock } = route.params;

  //qunatity data will be fetched from DB
  const [ownedStocks,setOwnedStocks] = useState(0);

  //quantity that user want to sell
  const [quantity, setQuantity] = useState("");

  const [totalPrice, setTotalPrice] = useState(0);
  const [holdingData, setHoldingData] = useState(null);

    useEffect(() => {
      fetchPortfolioDetails();
    }, [stock.symbol]);

  const fetchPortfolioDetails = async () => {
      // console.log("function called")
      const token = await getAuthToken();
      // console.log(token,"Token");

      if (!token) {
        console.log("no token found");
      }
      try {
        // console.log("Sending request to backend...");

        const res = await fetch(
          `http://192.168.56.1:5000/api/portfolio/holdings`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // console.log("Response status:", res.status);

        // Try to read JSON response safely
        const responseData = await res.json();

        // console.log("Response data:", responseData);
        setHoldingData(responseData);

        //fetching the owned quantity of stocks from DB
        const qty = responseData.holdings.find(
          (item) => item.symbol === stock.symbol
        ).quantity;
        setOwnedStocks(qty);

      } catch (error) {
        console.error("Network error:", error.message);
      }
    };




  //Updating the stocks of Stock after selling successfully
  const handleStocksSales = async () => {
    const token = await getAuthToken();

    if (!token) {
      console.log("no token found");
    }
    try {

      const res = await fetch(
        `http://192.168.56.1:5000/api/portfolio/sell`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body:JSON.stringify({
            symbol:stock.symbol,
            quantity:quantity
          })
        }
      );

    } catch (error) {
      console.error("Network error:", error.message);
    }
  };


  const handleCalculatePrice = () => {
    const qty = parseInt(quantity) || 0;

    if (qty <= 0 || qty > quantity) {
      Alert.alert("Invalid quantity. Ensure you have enough stocks.");
      return;
    }

    setTotalPrice(qty * stock.price);
  };

  const handleSell = async() => {

    const qty = parseInt(quantity) || 0;
    if (qty > ownedStocks) {
      Alert.alert("You don’t have enough stocks to sell.");
      return;
    }
    else{
      handleStocksSales();

      //saving the sold stock deatails in localStoraage
      const newTransection = {
        symbol: stock.symbol,
        quantity: quantity,
        timestamp: new Date(),
        total: stock.price * Number(quantity),
        type: "Sold",
      };

       // Retrieve previous transactions
    const storedTransactions = await AsyncStorage.getItem("transections");
    let transactions = storedTransactions ? JSON.parse(storedTransactions) : [];

    // Ensure transactions is an array
    if (!Array.isArray(transactions)) {
      transactions = [];
    }

      //if transections have already 5 object the remoce last
      if (transactions.length >= 5) {
        transactions.pop();
      }

      //save new recent transection to transections array
      transactions.unshift(newTransection);

      //update AsyncStorage
      await AsyncStorage.setItem("transections", JSON.stringify(transactions));

      Alert.alert(
        `Sold ${quantity} stocks of ${stock.name} for ₹${totalPrice}`
      );
    }


    // Pass updated owned stock count back to previous screen
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.companyName}>{stock.symbol} - Sell Stocks</Text>
      <Text style={styles.stockCurrentPrice}>
        Current Price: ₹{stock.price}
      </Text>

      <Text style={styles.text}>You own: {ownedStocks} stocks</Text>

      <Text style={styles.text}>Quantity:</Text>
      <TextInput
        style={styles.stockQuantityInput}
        placeholder="Enter quantity"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <Button title="Calculate Price" onPress={handleCalculatePrice} />
      {totalPrice ? (
        <Text style={styles.totalPrice}>Total Price: ₹{totalPrice}</Text>
      ) : null}

      <View style={styles.confirmSellBtn}>
        <Button title="Confirm Sell" onPress={handleSell} />
      </View>
    </View>
  );
};

export default SellScreen;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  stockCurrentPrice: {
    marginTop: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  stockQuantityInput: {
    marginVertical: 5,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
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
  confirmSellBtn: {
    marginTop: 20,
  },
});
