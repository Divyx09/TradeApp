import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, Card, HelperText, ActivityIndicator, Portal, Dialog } from "react-native-paper";
import { getAuthToken } from "../../config/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/urls";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useWallet } from "../../context/WalletContext";

const SellScreen = ({ navigation, route }) => {
  const { stock } = route.params;
  const { addMoney, refreshBalance } = useWallet();
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [holdingData, setHoldingData] = useState(null);
  const [ownedStocks, setOwnedStocks] = useState(0);

  // Calculate total price using useMemo
  const totalPrice = useMemo(() => {
    const qty = parseInt(quantity) || 0;
    return qty * stock.price;
  }, [quantity, stock.price]);

  const fetchPortfolioDetails = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/portfolio/holdings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch holdings");
      }

      const data = await response.json();
      setHoldingData(data);

      const holding = data.holdings.find(item => item.symbol === stock.symbol);
      if (holding) {
        setOwnedStocks(holding.quantity);
      } else {
        setOwnedStocks(0);
        setError("You don't own any shares of this stock");
      }
    } catch (error) {
      setError(error.message);
      setOwnedStocks(0);
    } finally {
      setIsFetching(false);
    }
  }, [stock.symbol]);

  useEffect(() => {
    fetchPortfolioDetails();
  }, [fetchPortfolioDetails]);

  const validateInput = useCallback(() => {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      setError("Please enter a valid quantity");
      return false;
    }
    if (qty > ownedStocks) {
      setError(`You can only sell up to ${ownedStocks} shares`);
      return false;
    }
    setError(null);
    return true;
  }, [quantity, ownedStocks]);

  const handleSellStockRequest = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${API_URL}/portfolio/sell`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          quantity: parseInt(quantity),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to sell stock");
      }

      // Add the money to wallet after successful sale
      await addMoney(totalPrice);

      // Save transaction to local storage
      const newTransaction = {
        symbol: stock.symbol,
        quantity: parseInt(quantity),
        timestamp: new Date().toISOString(),
        total: totalPrice,
        type: "SELL",
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

  const handleSell = () => {
    if (validateInput()) {
      setShowConfirmDialog(true);
    }
  };

  if (isFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading your holdings...</Text>
      </View>
    );
  }

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

        <Card style={styles.sellCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Your Holdings
            </Text>
            <Text variant="headlineMedium" style={styles.holdingsText}>
              {ownedStocks} shares
            </Text>

            <TextInput
              label="Quantity to Sell"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              error={!!error}
              right={<TextInput.Icon icon="calculator" />}
              disabled={isLoading || ownedStocks === 0}
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
                  <Text>Remaining Shares</Text>
                  <Text style={{ 
                    color: (ownedStocks - parseInt(quantity || 0)) < 0 ? '#FF4444' : '#4CAF50',
                    fontWeight: 'bold'
                  }}>
                    {(ownedStocks - parseInt(quantity || 0))}
                  </Text>
                </View>
              </View>
            )}

            <Button
              mode="contained"
              onPress={handleSell}
              style={styles.sellButton}
              disabled={isLoading || !quantity || !!error || ownedStocks === 0}
              loading={isLoading}
            >
              {isLoading ? 'Processing...' : 'Sell Now'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog visible={showConfirmDialog} onDismiss={() => !isLoading && setShowConfirmDialog(false)}>
          <Dialog.Title>Confirm Sale</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to sell {quantity} shares of {stock.symbol} for ₹{totalPrice.toFixed(2)}?
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
              onPress={handleSellStockRequest} 
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
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
  sellCard: {
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 8,
    color: "#666",
  },
  holdingsText: {
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
  sellButton: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: "#FF4444",
  },
});

export default SellScreen;
