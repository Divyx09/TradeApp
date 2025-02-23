import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Text, Card, Button, Searchbar, ActivityIndicator, Banner } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "@env";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NIFTY50_SYMBOLS = [
  'ADANIENT.NS', 'ADANIPORTS.NS', 'APOLLOHOSP.NS', 'ASIANPAINT.NS', 'AXISBANK.NS',
  'BAJAJ-AUTO.NS', 'BAJAJFINSV.NS', 'BAJFINANCE.NS', 'BEL.NS', 'BHARTIARTL.NS',
  'BPCL.NS', 'BRITANNIA.NS', 'CIPLA.NS', 'COALINDIA.NS', 'DIVISLAB.NS',
  'DRREDDY.NS', 'EICHERMOT.NS', 'GRASIM.NS', 'HCLTECH.NS', 'HDFCBANK.NS',
  'HDFCLIFE.NS', 'HEROMOTOCO.NS', 'HINDALCO.NS', 'HINDUNILVR.NS', 'ICICIBANK.NS',
  'INDUSINDBK.NS', 'INFY.NS', 'IOC.NS', 'ITC.NS', 'JSWSTEEL.NS',
  'KOTAKBANK.NS', 'LT.NS', 'M&M.NS', 'MARUTI.NS', 'NESTLEIND.NS',
  'NTPC.NS', 'ONGC.NS', 'POWERGRID.NS', 'RELIANCE.NS', 'SBILIFE.NS',
  'SBIN.NS', 'SUNPHARMA.NS', 'TATACONSUM.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS',
  'TCS.NS', 'TECHM.NS', 'TITAN.NS', 'ULTRACEMCO.NS', 'WIPRO.NS'
];

const StockList = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const yahooFinanceAPI = useMemo(() => 
    `${API_URL}/stocks/quotes?symbols=${NIFTY50_SYMBOLS.join(',')}`, 
    []
  );

  const fetchStockData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(yahooFinanceAPI);
      if (!response.ok) {
        throw new Error(`Failed to fetch stocks (${response.status})`);
      }
      const data = await response.json();
      setStocks(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [yahooFinanceAPI]);

  useEffect(() => {
    fetchStockData();
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchStockData, 30000);
    return () => clearInterval(intervalId);
  }, [fetchStockData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStockData();
  }, [fetchStockData]);

  const filteredStocks = useMemo(() => 
    stocks?.filter(stock => 
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [],
    [stocks, searchQuery]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="chart-line" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>
        {loading ? "Loading stocks..." : error ? "Failed to load stocks" : "No stocks found"}
      </Text>
      {error && (
        <Button 
          mode="contained" 
          onPress={fetchStockData}
          style={styles.retryButton}
        >
          Retry
        </Button>
      )}
    </View>
  );

  const renderStockItem = useCallback(({ item }) => (
    <Card
      style={styles.stockCard}
      onPress={() => navigation.navigate("StockDetails", { stock: item })}
    >
      <Card.Content>
        <View style={styles.stockHeader}>
          <View style={styles.stockInfo}>
            <Text variant="titleMedium" style={styles.symbolText}>
              {item.symbol.replace('.NS', '')}
            </Text>
            <Text variant="bodyMedium" style={styles.companyName}>
              {item.companyName || item.symbol}
            </Text>
          </View>
          <View style={styles.priceInfo}>
            <Text variant="titleMedium" style={styles.priceText}>
              ₹{item.price?.toLocaleString('en-IN', { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2 
              })}
            </Text>
            <Text
              style={[
                styles.changeText,
                { color: item.change < 0 ? '#FF4444' : '#4CAF50' }
              ]}
            >
              {item.change < 0 ? '▼' : '▲'} {Math.abs(item.changePercent).toFixed(2)}%
            </Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Buy", { stock: item })}
          style={[styles.actionButton, styles.buyButton]}
          labelStyle={styles.buttonLabel}
        >
          Buy
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Sell", { stock: item })}
          style={[styles.actionButton, styles.sellButton]}
          labelStyle={styles.buttonLabel}
        >
          Sell
        </Button>
      </Card.Actions>
    </Card>
  ), [navigation]);

  return (
    <View style={styles.container}>
      {error && (
        <Banner
          visible={true}
          actions={[{ label: 'Retry', onPress: fetchStockData }]}
          icon="alert-circle"
        >
          {error}
        </Banner>
      )}
      
      <Searchbar
        placeholder="Search by symbol or company name"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        icon={() => <MaterialCommunityIcons name="magnify" size={24} color="#666" />}
      />

      <FlatList
        data={filteredStocks}
        renderItem={renderStockItem}
        keyExtractor={(item) => item.symbol}
        contentContainerStyle={[
          styles.listContainer,
          !filteredStocks.length && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchBar: {
    margin: 16,
    elevation: 2,
    borderRadius: 10,
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  stockCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  stockInfo: {
    flex: 1,
  },
  symbolText: {
    fontWeight: "bold",
  },
  companyName: {
    color: "#666",
    marginTop: 2,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  priceText: {
    fontWeight: "bold",
  },
  changeText: {
    fontWeight: "bold",
    marginTop: 2,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  actionButton: {
    flex: 0.48,
    borderRadius: 8,
  },
  buyButton: {
    backgroundColor: '#4CAF50',
  },
  sellButton: {
    backgroundColor: '#FF4444',
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
});

export default StockList;
