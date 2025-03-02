import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, DataTable, ActivityIndicator, Surface, Button } from "react-native-paper";
import { getAuthToken } from "../../config/axios";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "../../config/urls";
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
  const { totalValue, totalInvestment, totalPnL, totalPnLPercentage } = useMemo(() => {
    const totalValue = data.holdings.reduce(
      (sum, stock) => sum + stock.currentPrice * stock.quantity,
      0
    );
    const totalInvestment = data.holdings.reduce(
      (sum, stock) => sum + stock.averageBuyPrice * stock.quantity,
      0
    );
    const totalPnL = totalValue - totalInvestment;
    const totalPnLPercentage = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;
    
    return {
      totalValue,
      totalInvestment,
      totalPnL,
      totalPnLPercentage
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
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text style={styles.loadingText}>Loading portfolio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#FF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={fetchPortfolio} 
          style={styles.retryButton}
          buttonColor="#00B4D8"
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Portfolio Summary Cards */}
      <View style={styles.summaryContainer}>
        <Surface style={styles.summaryCard}>
          <MaterialCommunityIcons name="chart-line-variant" size={24} color="#00B4D8" />
          <Text style={styles.summaryLabel}>Current Value</Text>
          <Text style={styles.summaryValue}>₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
        </Surface>

        <Surface style={styles.summaryCard}>
          <MaterialCommunityIcons name="cash" size={24} color="#00B4D8" />
          <Text style={styles.summaryLabel}>Investment</Text>
          <Text style={styles.summaryValue}>₹{totalInvestment.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
        </Surface>

        <Surface style={[styles.summaryCard, { backgroundColor: totalPnL >= 0 ? '#4CAF5020' : '#FF444420' }]}>
          <MaterialCommunityIcons 
            name={totalPnL >= 0 ? "trending-up" : "trending-down"} 
            size={24} 
            color={totalPnL >= 0 ? "#4CAF50" : "#FF4444"}
          />
          <Text style={styles.summaryLabel}>Total P&L</Text>
          <Text style={[styles.summaryValue, { color: totalPnL >= 0 ? "#4CAF50" : "#FF4444" }]}>
            {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            {"\n"}
            <Text style={styles.pnlPercentage}>
              ({totalPnL >= 0 ? "+" : ""}{totalPnLPercentage.toFixed(2)}%)
            </Text>
          </Text>
        </Surface>
      </View>

      {/* Holdings Table */}
      <Card style={styles.holdingsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.holdingsTitle}>
            Your Holdings
          </Text>
          {data.holdings.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="folder-open-outline" size={48} color="#666" />
              <Text style={styles.emptyStateText}>No holdings found</Text>
              <Text style={styles.emptyStateSubtext}>Start trading to build your portfolio</Text>
            </View>
          ) : (
            <DataTable style={styles.table}>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title textStyle={styles.headerText}>Stock</DataTable.Title>
                <DataTable.Title numeric textStyle={styles.headerText}>Qty</DataTable.Title>
                <DataTable.Title numeric textStyle={styles.headerText}>Avg</DataTable.Title>
                <DataTable.Title numeric textStyle={styles.headerText}>LTP</DataTable.Title>
                <DataTable.Title numeric textStyle={styles.headerText}>P&L</DataTable.Title>
              </DataTable.Header>

              {data.holdings.map((holding) => {
                const pnl = Number(stockPnl[holding.symbol]);
                const pnlPercentage = ((holding.currentPrice - holding.averageBuyPrice) / holding.averageBuyPrice) * 100;
                
                return (
                  <DataTable.Row key={holding.symbol} style={styles.tableRow}>
                    <DataTable.Cell textStyle={styles.symbolCell}>
                      <Text style={styles.symbolText}>{holding.symbol}</Text>
                      <Text style={styles.companyName}>{holding.companyName}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric textStyle={styles.cellText}>
                      {holding.quantity}
                    </DataTable.Cell>
                    <DataTable.Cell numeric textStyle={styles.cellText}>
                      {holding.averageBuyPrice.toFixed(2)}
                    </DataTable.Cell>
                    <DataTable.Cell numeric textStyle={styles.cellText}>
                      {holding.currentPrice.toFixed(2)}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <View style={styles.pnlContainer}>
                        <Text style={[styles.pnlText, { color: pnl >= 0 ? "#4CAF50" : "#FF4444" }]}>
                          {pnl >= 0 ? "+" : ""}{pnl}
                        </Text>
                        <Text style={[styles.pnlPercentageText, { color: pnl >= 0 ? "#4CAF50" : "#FF4444" }]}>
                          ({pnlPercentage >= 0 ? "+" : ""}{pnlPercentage.toFixed(2)}%)
                        </Text>
                      </View>
                    </DataTable.Cell>
                  </DataTable.Row>
                );
              })}
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
    backgroundColor: "#121212",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  loadingText: {
    marginTop: 16,
    color: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#121212",
  },
  errorText: {
    color: "#FF4444",
    marginVertical: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    flexWrap: "wrap",
  },
  summaryCard: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "31%",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  summaryLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#B0B0B0",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 4,
    color: "#FFFFFF",
    textAlign: "center",
  },
  pnlPercentage: {
    fontSize: 12,
  },
  holdingsCard: {
    margin: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  holdingsTitle: {
    color: "#FFFFFF",
    marginBottom: 16,
    fontSize: 18,
    fontWeight: "bold",
  },
  table: {
    backgroundColor: "#1E1E1E",
  },
  tableHeader: {
    backgroundColor: "#2A2A2A",
    borderBottomWidth: 1,
    borderBottomColor: "#3D3D3D",
  },
  headerText: {
    color: "#B0B0B0",
    fontWeight: "bold",
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  symbolCell: {
    flex: 1,
  },
  symbolText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  companyName: {
    color: "#B0B0B0",
    fontSize: 12,
  },
  cellText: {
    color: "#FFFFFF",
  },
  pnlContainer: {
    alignItems: "flex-end",
  },
  pnlText: {
    fontWeight: "bold",
  },
  pnlPercentageText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    marginTop: 8,
    color: "#999",
  },
});

export default Portfolio;
