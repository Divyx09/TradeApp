import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, Card, HelperText, ActivityIndicator, Portal, Dialog } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthToken } from "../../config/axios";
import { API_URL } from "../../config/urls";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from "../../context/WalletContext";

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

      // First try to remove money from wallet
      await removeMoney(totalPrice);

      const response = await fetch(`${API_URL}/portfolio/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          quantity: parseInt(quantity),
          companyName: stock.companyName || stock.symbol,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If the API call fails, we should add the money back to the wallet
        await addMoney(totalPrice);
        throw new Error(data.message || "Failed to buy stock");
      }

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

      navigation.goBack();
    } catch (error) {
      setError(error.message);
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.stockInfoCard}>
          <Card.Content>
            <View style={styles.stockHeader}>
              <View>
                <Text variant="titleLarge" style={styles.symbolText}>
                  {stock.symbol.replace('.NS', '')}
                </Text>
                <Text variant="bodyMedium" style={styles.companyName}>
                  {stock.companyName || stock.symbol}
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text variant="titleMedium" style={styles.currentPrice}>
                  ₹{stock.price.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Text>
                <Text
                  style={[
                    styles.priceChange,
                    { color: stock.change < 0 ? '#FF4444' : '#4CAF50' }
                  ]}
                >
                  {stock.change < 0 ? '▼' : '▲'} {Math.abs(stock.changePercent).toFixed(2)}%
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.buyCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Available Balance
            </Text>
            <Text variant="headlineMedium" style={styles.balanceText}>
              {walletLoading ? (
                <ActivityIndicator size="small" color={paperTheme.colors.primary} />
              ) : (
                `₹${balance.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}`
              )}
            </Text>

            <TextInput
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              error={!!error}
              right={<TextInput.Icon icon="calculator" />}
              disabled={isLoading}
            />
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>

            {quantity !== "" && (
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text>Price per share</Text>
                  <Text>₹{stock.price.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>Total Amount</Text>
                  <Text style={styles.totalText}>₹{totalPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>Remaining Balance</Text>
                  <Text style={{ 
                    color: remainingBalance < 0 ? '#FF4444' : '#4CAF50',
                    fontWeight: 'bold'
                  }}>
                    ₹{remainingBalance.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleBuy}
              style={styles.buyButton}
              disabled={isLoading || !quantity || !!error}
              loading={isLoading}
            >
              {isLoading ? 'Processing...' : 'Buy Now'}
            </Button>
          </Card.Content>
        </Card>
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
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
  },
  stockInfoCard: {
    marginBottom: 16,
    elevation: 2,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  symbolText: {
    fontWeight: "bold",
  },
  companyName: {
    color: "#666",
    marginTop: 4,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  currentPrice: {
    fontWeight: "bold",
  },
  priceChange: {
    fontWeight: "bold",
    marginTop: 4,
  },
  buyCard: {
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 8,
    color: "#666",
  },
  balanceText: {
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2196F3",
  },
  input: {
    marginBottom: 4,
  },
  summaryContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  buyButton: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: "#4CAF50",
  },
});

export default BuyScreen;
