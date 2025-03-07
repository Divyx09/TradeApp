import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, DataTable, ActivityIndicator, Surface, Button, SegmentedButtons } from "react-native-paper";
import { getAuthToken } from "../../config/axios";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "../../config/urls";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Portfolio = () => {
  const [data, setData] = useState({ holdings: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('stocks');

  const fetchPortfolio = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get holdings from AsyncStorage
      const storedPortfolio = await AsyncStorage.getItem("portfolio");
      const portfolio = storedPortfolio ? JSON.parse(storedPortfolio) : [];
      
      // Get stock holdings from API
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

      const apiResult = await response.json();
      
      // Combine API stock holdings with local forex/crypto holdings
      const allHoldings = [
        ...apiResult.holdings.map(h => ({ ...h, category: 'STOCKS' })),
        ...portfolio.filter(h => h.category === 'FOREX' || h.category === 'CRYPTO')
      ];

      setData({ holdings: allHoldings });
    } catch (error) {
      console.error("Network Error:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate total values using useMemo for the active category
  const { totalValue, totalInvestment, totalPnL, totalPnLPercentage } = useMemo(() => {
    const filteredHoldings = data.holdings.filter(h => 
      activeTab === 'stocks' ? h.category === 'STOCKS' : 
      activeTab === 'forex' ? h.category === 'FOREX' : 
      h.category === 'CRYPTO'
    );

    const totalValue = filteredHoldings.reduce(
      (sum, holding) => sum + (holding.currentPrice || holding.price) * (holding.quantity || holding.amount),
      0
    );
    const totalInvestment = filteredHoldings.reduce(
      (sum, holding) => sum + (holding.averageBuyPrice || holding.price) * (holding.quantity || holding.amount),
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
  }, [data.holdings, activeTab]);

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

  const filteredHoldings = data.holdings.filter(h => 
    activeTab === 'stocks' ? h.category === 'STOCKS' : 
    activeTab === 'forex' ? h.category === 'FOREX' : 
    h.category === 'CRYPTO'
  );

  return (
    <ScrollView style={styles.container}>
      {/* Portfolio Type Selector */}
      <Surface style={styles.header} elevation={2}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'stocks', label: 'Stocks' },
            { value: 'forex', label: 'Forex' },
            { value: 'crypto', label: 'Crypto' },
          ]}
          style={styles.segmentedButtons}
        />
      </Surface>

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
            Your {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Holdings
          </Text>
          {filteredHoldings.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="folder-open-outline" size={48} color="#666" />
              <Text style={styles.emptyStateText}>No holdings found</Text>
              <Text style={styles.emptyStateSubtext}>
                Start trading to build your {activeTab} portfolio
              </Text>
            </View>
          ) : (
            <DataTable style={styles.table}>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title textStyle={styles.headerText}>
                  {activeTab === 'stocks' ? 'Stock' : activeTab === 'forex' ? 'Pair' : 'Crypto'}
                </DataTable.Title>
                {activeTab === 'stocks' ? (
                  <DataTable.Title numeric textStyle={styles.headerText}>Qty</DataTable.Title>
                ) : (
                  <DataTable.Title numeric textStyle={styles.headerText}>Amount</DataTable.Title>
                )}
                <DataTable.Title numeric textStyle={styles.headerText}>Avg</DataTable.Title>
                <DataTable.Title numeric textStyle={styles.headerText}>LTP</DataTable.Title>
                <DataTable.Title numeric textStyle={styles.headerText}>P&L</DataTable.Title>
              </DataTable.Header>

              {filteredHoldings.map((holding) => {
                const currentPrice = holding.currentPrice || holding.price;
                const quantity = holding.quantity || holding.amount;
                const avgPrice = holding.averageBuyPrice || holding.price;
                const pnl = (currentPrice - avgPrice) * quantity;
                const pnlPercentage = ((currentPrice - avgPrice) / avgPrice) * 100;
                
                return (
                  <DataTable.Row key={holding.symbol} style={styles.tableRow}>
                    <DataTable.Cell textStyle={styles.symbolCell}>
                      <Text style={styles.symbolText}>{holding.symbol}</Text>
                      <Text style={styles.companyName}>{holding.name || holding.companyName}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric textStyle={styles.cellText}>
                      {quantity}
                    </DataTable.Cell>
                    <DataTable.Cell numeric textStyle={styles.cellText}>
                      {avgPrice.toFixed(activeTab === 'stocks' ? 2 : 4)}
                    </DataTable.Cell>
                    <DataTable.Cell numeric textStyle={styles.cellText}>
                      {currentPrice.toFixed(activeTab === 'stocks' ? 2 : 4)}
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <View style={styles.pnlContainer}>
                        <Text style={[styles.pnlText, { color: pnl >= 0 ? "#4CAF50" : "#FF4444" }]}>
                          {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
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
  header: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  segmentedButtons: {
    backgroundColor: "#1E1E1E",
  },
});

export default Portfolio;
