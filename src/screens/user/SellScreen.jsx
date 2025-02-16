import { StyleSheet, Text, View, Button, TextInput, Alert } from "react-native";
import React, { useState } from "react";

const SellScreen = ({ navigation, route }) => {
  const { stock } = route.params;
  //dummy
  const ownedStocks = 10;
  const [quantity, setQuantity] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  const handleCalculatePrice = () => {
    const qty = parseInt(quantity) || 0;

    if (qty <= 0 || qty > ownedStocks) {
      Alert.alert("Invalid quantity. Ensure you have enough stocks.");
      return;
    }

    setTotalPrice(qty * stock.price);
  };

  const handleSell = () => {
    const qty = parseInt(quantity) || 0;

    if (qty > ownedStocks) {
      Alert.alert("You don’t have enough stocks to sell.");
      return;
    }

    Alert.alert(`Sold ${quantity} stocks of ${stock.name} for ₹${totalPrice}`);

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
