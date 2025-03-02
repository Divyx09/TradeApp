import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, Card, HelperText, ActivityIndicator, Portal, Dialog, Surface, Chip } from "react-native-paper";
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

          <View style={styles.holdingInfo}>
            <Text style={styles.holdingLabel}>Your Holdings</Text>
            <Text style={styles.holdingAmount}>
              {stock.quantity || 0} shares
            </Text>
          </View>

          <TextInput
            label="Quantity to Sell"
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
              ₹{totalPrice.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </Surface>

          <Button
            mode="contained"
            onPress={handleSell}
            style={styles.sellButton}
            disabled={isLoading || !quantity}
            loading={isLoading}
          >
            {isLoading ? "Processing..." : "Sell Now"}
          </Button>
        </Surface>
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
    backgroundColor: "#121212",
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
  holdingInfo: {
    backgroundColor: "#2A2A2A",
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  holdingLabel: {
    fontSize: 14,
    color: "#B0B0B0",
    marginBottom: 4,
  },
  holdingAmount: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
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
  sellButton: {
    backgroundColor: "#FF4444",
    paddingVertical: 8,
  },
});

export default SellScreen;
