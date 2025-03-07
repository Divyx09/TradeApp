import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import { Text, Surface, ActivityIndicator, Chip, Card, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../../config/urls';
import axios from '../../config/axios';

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

const CRYPTO_PAIRS = [
  { symbol: "BTC/USD", name: "Bitcoin/US Dollar", category: "Major" },
  { symbol: "ETH/USD", name: "Ethereum/US Dollar", category: "Major" },
  { symbol: "BNB/USD", name: "Binance Coin/US Dollar", category: "Major" },
  { symbol: "XRP/USD", name: "Ripple/US Dollar", category: "Major" },
  { symbol: "ADA/USD", name: "Cardano/US Dollar", category: "Major" },
  { symbol: "SOL/USD", name: "Solana/US Dollar", category: "Major" },
  { symbol: "DOT/USD", name: "Polkadot/US Dollar", category: "Alt" },
  { symbol: "DOGE/USD", name: "Dogecoin/US Dollar", category: "Alt" },
  { symbol: "MATIC/USD", name: "Polygon/US Dollar", category: "Alt" },
  { symbol: "LINK/USD", name: "Chainlink/US Dollar", category: "Alt" }
];

const ForexScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('forex');
  const [forexPairs, setForexPairs] = useState([]);
  const [cryptoPairs, setCryptoPairs] = useState([]);

  const fetchData = async () => {
    try {
      setError(null);
      // Only fetch forex data for now
      const forexResponse = await axios.get(`${API_URL}/forex/pairs`);
      setForexPairs(forexResponse.data);
      
      // Use static data for crypto until API is ready
      setCryptoPairs(CRYPTO_PAIRS.map(pair => ({
        ...pair,
        price: Math.random() * (100000 - 100) + 100, // Random price for demo
        change: (Math.random() * 10) - 5, // Random change between -5 and +5
        changePercent: (Math.random() * 10) - 5 // Random percent between -5 and +5
      })));
    } catch (error) {
      if (error.response?.status === 404 && error.config.url.includes('crypto')) {
        // Ignore 404 errors for crypto endpoint
        console.log('Crypto API not yet available, using static data');
      } else {
        setError('Failed to fetch data');
        console.error('Error fetching data:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const renderMarketCard = ({ item }) => {
    const price = parseFloat(item.price) || 0;
    const change = parseFloat(item.change || 0);
    const changePercent = parseFloat(item.changePercent || 0);

    return (
      <Card
        style={styles.marketCard}
        onPress={() => {
          navigation.navigate('ForexDetails', {
            forex: {
              ...item,
              price,
              change,
              changePercent
            }
          });
        }}
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
              {price.toFixed(activeTab === 'crypto' ? 2 : 4)}
            </Text>
            <View style={styles.changeContainer}>
              <MaterialCommunityIcons
                name={change >= 0 ? "trending-up" : "trending-down"}
                size={20}
                color={change >= 0 ? "#4CAF50" : "#FF4444"}
                style={styles.trendIcon}
              />
              <Text
                style={[
                  styles.change,
                  { color: change >= 0 ? "#4CAF50" : "#FF4444" }
                ]}
              >
                {change >= 0 ? "+" : ""}
                {changePercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text style={styles.loadingText}>Loading market data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            {
              value: 'forex',
              label: 'Forex',
              icon: 'currency-usd',
            },
            {
              value: 'crypto',
              label: 'Crypto',
              icon: 'bitcoin',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </Surface>

      <FlatList
        data={activeTab === 'forex' 
          ? (forexPairs.length > 0 ? forexPairs : FOREX_PAIRS)
          : (cryptoPairs.length > 0 ? cryptoPairs : CRYPTO_PAIRS)
        }
        renderItem={renderMarketCard}
        keyExtractor={(item) => item.symbol}
        contentContainerStyle={styles.listContainer}
        onRefresh={fetchData}
        refreshing={refreshing}
        ListHeaderComponent={
          <View style={styles.marketHeader}>
            <Text style={styles.marketTitle}>
              {activeTab === 'forex' ? 'Foreign Exchange' : 'Cryptocurrency'}
            </Text>
            <Text style={styles.marketSubtitle}>
              {activeTab === 'forex' 
                ? 'Trade major and cross currency pairs'
                : 'Trade popular cryptocurrencies'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  segmentedButtons: {
    backgroundColor: '#2A2A2A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  marketHeader: {
    marginBottom: 16,
  },
  marketTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  marketSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  marketCard: {
    backgroundColor: '#1E1E1E',
    marginBottom: 12,
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  symbolContainer: {
    flex: 1,
    marginRight: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 2,
  },
  categoryChip: {
    backgroundColor: '#1A237E20',
    height: 24,
  },
  priceRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    marginRight: 4,
  },
  change: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ForexScreen; 