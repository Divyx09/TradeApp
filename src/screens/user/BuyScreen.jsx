import { StyleSheet, Text, View, Button, TextInput, Alert } from "react-native";
import { useState } from "react";
// import usePortfolioStore from "./store/store";

const BuyScreen = ({ navigation, route }) => {
  const { stock } = route.params;
//   const buyStock = usePortfolioStore((state) => state.buyStock);

  //stocks quantity
  const [quantity, setQuantity] = useState("1");
  const [totalPrice, setTotalPrice] = useState(0);

  const handleCalculatePrice = () => {
    const qty = parseInt(quantity) || 0;

    if (qty == 0) {
      Alert.alert("Enter valid quantity.");
    }
    setTotalPrice(qty * stock.price);
  };

  const handleBuy = () => {
    const availableBal = 10000;
    const remainingBal = availableBal - totalPrice;

    if (remainingBal >= 0) {
      Alert.alert(
        `You have bought ${quantity} stocks of ${stock.symbol} worth : ${totalPrice}`
      );
      // availableBal -= remainingBal;

    //   //using zunstand to manage user owned stocks quantity
    //   buyStock({
    //     name: stock.name,
    //     ownedStocks: Number(quantity),
    //   });

      setQuantity("");
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
