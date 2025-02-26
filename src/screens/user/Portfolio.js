import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, DataTable, ActivityIndicator } from "react-native-paper";
import { getAuthToken } from "../../config/axios";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "../../config/urls";

const Portfolio = () => {
  const [data, setData] = useState({ holdings: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/portfolio/holdings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch portfolio");
      }

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Network Error:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate stock PnL using useMemo
  const stockPnl = useMemo(() => {
    const pnl = {};
    for (const holding of data.holdings) {
      pnl[holding.symbol] = (
        holding.currentPrice * holding.quantity -
        holding.averageBuyPrice * holding.quantity
      ).toFixed(2);
    }
    return pnl;
  }, [data.holdings]);

  // Calculate total values using useMemo
  const { totalValue, totalInvestment, totalPnL } = useMemo(() => {
    const totalValue = data.holdings.reduce(
      (sum, stock) => sum + stock.currentPrice * stock.quantity,
      0
    );
    const totalInvestment = data.holdings.reduce(
      (sum, stock) => sum + stock.averageBuyPrice * stock.quantity,
      0
    );
    return {
      totalValue,
      totalInvestment,
      totalPnL: totalValue - totalInvestment
    };
  }, [data.holdings]);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPortfolio();
    }, [fetchPortfolio])
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading portfolio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={fetchPortfolio} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleLarge">Portfolio Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="bodyMedium">Current Value</Text>
              <Text variant="titleMedium">₹{totalValue.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="bodyMedium">Total P&L</Text>
              <Text
                variant="titleMedium"
                style={{ color: totalPnL >= 0 ? "#4CAF50" : "#FF4444" }}
              >
                ₹{totalPnL.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.holdingsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.holdingsTitle}>
            Your Holdings
          </Text>
          {data.holdings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No holdings found</Text>
              <Text style={styles.emptyStateSubtext}>Start trading to build your portfolio</Text>
            </View>
          ) : (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Stock</DataTable.Title>
                <DataTable.Title numeric>Qty</DataTable.Title>
                <DataTable.Title numeric>Avg</DataTable.Title>
                <DataTable.Title numeric>LTP</DataTable.Title>
                <DataTable.Title numeric>P&L</DataTable.Title>
              </DataTable.Header>

              {data.holdings.map((holding) => (
                <DataTable.Row key={holding.symbol}>
                  <DataTable.Cell>{holding.symbol}</DataTable.Cell>
                  <DataTable.Cell numeric>{holding.quantity}</DataTable.Cell>
                  <DataTable.Cell numeric>
                    {holding.averageBuyPrice.toFixed(2)}
                  </DataTable.Cell>
                  <DataTable.Cell numeric>{holding.currentPrice}</DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Text
                      style={{
                        color: stockPnl[holding.symbol] > 0 ? "#4CAF50" : "#FF4444",
                      }}
                    >
                      {stockPnl[holding.symbol]}
                    </Text>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF4444",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
  },
  summaryCard: {
    margin: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  summaryItem: {
    alignItems: "center",
  },
  holdingsCard: {
    margin: 16,
  },
  holdingsTitle: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  emptyStateSubtext: {
    marginTop: 8,
    color: "#999",
  },
});

export default Portfolio;
