import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl } from "react-native";
import {
  Text,
  Card,
  ActivityIndicator,
  Surface,
  Chip,
  Searchbar,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { API_URL } from "../../config/urls";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const FOREX_PAIRS = [
  { symbol: "EUR/USD", name: "Euro/US Dollar", category: "Major" },
  { symbol: "GBP/USD", name: "British Pound/US Dollar", category: "Major" },
  { symbol: "USD/JPY", name: "US Dollar/Japanese Yen", category: "Major" },
  { symbol: "USD/CHF", name: "US Dollar/Swiss Franc", category: "Major" },
  { symbol: "AUD/USD", name: "Australian Dollar/US Dollar", category: "Major" },
  { symbol: "USD/CAD", name: "US Dollar/Canadian Dollar", category: "Major" },
  { symbol: "NZD/USD", name: "New Zealand Dollar/US Dollar", category: "Major" },
  { symbol: "EUR/GBP", name: "Euro/British Pound", category: "Cross" },
  { symbol: "EUR/JPY", name: "Euro/Japanese Yen", category: "Cross" },
  { symbol: "GBP/JPY", name: "British Pound/Japanese Yen", category: "Cross" }
];

const ForexList = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [forexData, setForexData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchForexData = useCallback(async () => {
    try {
      setLoading(true);
      const symbols = FOREX_PAIRS.map(pair => pair.symbol).join(',');
      const response = await fetch(`${API_URL}/forex/quotes?symbols=${symbols}`);
      if (!response.ok) throw new Error('Failed to fetch forex data');
      
      const data = await response.json();
      const formattedData = FOREX_PAIRS.map(pair => {
        const quote = data.find(q => q.symbol === pair.symbol) || {};
        return {
          ...pair,
          ...quote,
          price: quote.price || 0,
          change: quote.change || 0,
          changePercent: quote.changePercent || 0,
        };
      });
      
      setForexData(formattedData);
    } catch (error) {
      console.error('Error fetching forex data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchForexData();
    const interval = setInterval(fetchForexData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchForexData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchForexData();
  }, [fetchForexData]);

  const filteredForex = forexData.filter(pair =>
    pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pair.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderForexCard = ({ item }) => (
    <Card
      style={styles.forexCard}
      onPress={() => navigation.navigate("ForexDetails", { forex: item })}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.headerRow}>
          <View style={styles.symbolContainer}>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          </View>
          <Chip
            style={[styles.categoryChip]}
            textStyle={{ color: "#90CAF9", fontSize: 12 }}
          >
            {item.category}
          </Chip>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {item.price.toFixed(4)}
          </Text>
          <Text
            style={[
              styles.change,
              { color: item.changePercent >= 0 ? "#4CAF50" : "#FF4444" }
            ]}
          >
            {item.changePercent >= 0 ? "+" : ""}
            {item.changePercent.toFixed(2)}%
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Searchbar
          placeholder="Search forex pairs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          icon={() => (
            <MaterialCommunityIcons name="magnify" size={24} color="#666" />
          )}
        />
      </Surface>

      {loading && !refreshing ? (
        <ActivityIndicator style={styles.loader} size="large" />
      ) : (
        <FlatList
          data={filteredForex}
          renderItem={renderForexCard}
          keyExtractor={(item) => item.symbol}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="currency-usd" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? "No forex pairs found matching your search"
                  : "No forex pairs available"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    backgroundColor: "#1E1E1E",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  searchBar: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
  },
  listContainer: {
    padding: 16,
  },
  forexCard: {
    backgroundColor: "#1E1E1E",
    marginBottom: 12,
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  symbolContainer: {
    flex: 1,
    marginRight: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 12,
    color: "#B0B0B0",
    marginTop: 2,
  },
  categoryChip: {
    backgroundColor: "#1A237E20",
    height: 24,
  },
  priceRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  change: {
    fontSize: 16,
    fontWeight: "500",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    color: "#B0B0B0",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
});

export default ForexList; 