import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, Card, HelperText, ActivityIndicator, Portal, Dialog, Surface, Chip } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthToken } from "../../config/axios";
import { API_URL } from "../../config/urls";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from "../../context/WalletContext";
import axios from "../../config/axios";

const BuyScreen = ({ navigation, route }) => {
  const { stock } = route.params;
  const { balance, removeMoney, addMoney, refreshBalance, isLoading: walletLoading } = useWallet();
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Calculate total price using useMemo to prevent unnecessary recalculations
  const totalPrice = useMemo(() => {
    const qty = parseInt(quantity) || 0;
    return qty * stock.price;
  }, [quantity, stock.price]);

  // Calculate remaining balance
  const remainingBalance = useMemo(() => {
    return balance - totalPrice;
  }, [balance, totalPrice]);

  // Validate input
  const validateInput = useCallback(() => {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      setError("Please enter a valid quantity");
      return false;
    }
    if (remainingBalance < 0) {
      setError("Insufficient balance");
      return false;
    }
    setError(null);
    return true;
  }, [quantity, remainingBalance]);

  const handleBuyStockRequest = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Authentication required");
      }

      // Make the buy request first
      const response = await axios.post("/portfolio/buy", {
        symbol: stock.symbol,
        quantity: parseInt(quantity),
        companyName: stock.companyName
      });

      if (!response.data) {
        throw new Error("Failed to buy stock");
      }

      // Only remove money from wallet after successful trade
      await removeMoney(totalPrice);

      // Save transaction to local storage
      const newTransaction = {
        symbol: stock.symbol,
        quantity: parseInt(quantity),
        timestamp: new Date().toISOString(),
        total: totalPrice,
        type: "BUY",
        price: stock.price
      };

      const storedTransactions = await AsyncStorage.getItem("transections");
      let transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      
      if (!Array.isArray(transactions)) transactions = [];
      if (transactions.length >= 5) transactions.pop();
      
      transactions.unshift(newTransaction);
      await AsyncStorage.setItem("transections", JSON.stringify(transactions));

      // Refresh wallet balance
      await refreshBalance();

      // Navigate back to the previous screen
      navigation.goBack();
    } catch (error) {
      console.error("Error buying stock:", error);
      setError(
        error.response?.data?.message ||
          "Failed to buy stock. Please try again later.",
      );
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleBuy = () => {
    if (validateInput()) {
      setShowConfirmDialog(true);
    }
  };

  const totalAmount = quantity ? stock.price * parseInt(quantity) : 0;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.card} elevation={2}>
          <View style={styles.header}>
            <View>
              <Text style={styles.symbol}>{stock.symbol}</Text>
              <Text style={styles.companyName}>{stock.companyName}</Text>
            </View>
            <Chip
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    stock.category === "Indian" ? "#E3F2FD20" : "#FFF3E020",
                },
              ]}
            >
              <Text
                style={{
                  color: stock.category === "Indian" ? "#90CAF9" : "#FFB74D",
                }}
              >
                {stock.category}
              </Text>
            </Chip>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Current Price</Text>
            <Text style={styles.price}>
              {stock.category === "Indian" ? "₹" : "$"}
              {stock.price?.toLocaleString(
                stock.category === "Indian" ? "en-IN" : "en-US",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                },
              )}
            </Text>
          </View>

          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₹{balance.toFixed(2)}</Text>
          </View>

          <TextInput
            label="Quantity"
            value={quantity}
            onChangeText={(text) => {
              setQuantity(text.replace(/[^0-9]/g, ""));
              setError(null);
            }}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            error={!!error}
            outlineColor="#404040"
            activeOutlineColor="#00B4D8"
            textColor="#FFFFFF"
            theme={{
              colors: {
                background: '#2A2A2A',
                placeholder: '#808080',
                text: '#FFFFFF'
              }
            }}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Surface style={styles.totalContainer} elevation={1}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              ₹{totalAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </Surface>

          <Button
            mode="contained"
            onPress={handleBuy}
            style={styles.buyButton}
            disabled={isLoading || !quantity || !!error}
            loading={isLoading}
          >
            {isLoading ? "Processing..." : "Buy Now"}
          </Button>
        </Surface>
      </ScrollView>

      <Portal>
        <Dialog visible={showConfirmDialog} onDismiss={() => !isLoading && setShowConfirmDialog(false)}>
          <Dialog.Title>Confirm Purchase</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to buy {quantity} shares of {stock.symbol} for ₹{totalPrice.toFixed(2)}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setShowConfirmDialog(false)} 
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleBuyStockRequest} 
              loading={isLoading}
              disabled={isLoading}
            >
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  symbol: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  companyName: {
    fontSize: 14,
    color: "#B0B0B0",
    marginTop: 4,
  },
  categoryChip: {
    borderRadius: 16,
  },
  priceContainer: {
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: "#B0B0B0",
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  balanceInfo: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#B0B0B0",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4CAF50",
  },
  input: {
    marginBottom: 24,
    backgroundColor: "#2A2A2A",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    marginBottom: 16,
  },
  totalContainer: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    color: "#B0B0B0",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  buyButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
  },
});

export default BuyScreen;
