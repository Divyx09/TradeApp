import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Surface, Button, ActivityIndicator, Chip, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../../config/urls';
import axios from '../../config/axios';
import { useWallet } from '../../context/WalletContext';
import { WebView } from 'react-native-webview';

const ForexScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [forexPairs, setForexPairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState(null);
  const [amount, setAmount] = useState('');
  const [tradeType, setTradeType] = useState('BUY');
  const { balance, refreshBalance } = useWallet();

  const generateTradingViewWidget = (symbol) => {
    // Convert symbol format from EUR/USD to EURUSD for TradingView
    const formattedSymbol = symbol ? symbol.replace('/', '') : 'EURUSD';
    
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; }
            .tradingview-widget-container { height: 100%; }
          </style>
        </head>
        <body>
          <div class="tradingview-widget-container">
            <div id="tradingview_widget"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
            <script type="text/javascript">
              new TradingView.widget({
                "width": "100%",
                "height": "100%",
                "symbol": "FX:${formattedSymbol}",
                "interval": "D",
                "timezone": "exchange",
                "theme": "dark",
                "style": "1",
                "toolbar_bg": "#1E1E1E",
                "enable_publishing": false,
                "hide_top_toolbar": false,
                "save_image": false,
                "container_id": "tradingview_widget",
                "hide_volume": true,
                "backgroundColor": "#1E1E1E",
                "gridColor": "#2A2A2A",
                "locale": "en"
              });
            </script>
          </div>
        </body>
      </html>
    `;
  };

  const fetchForexPairs = async () => {
    try {
      setError(null);
      const response = await axios.get(`${API_URL}/forex/pairs`);
      setForexPairs(response.data);
      if (response.data.length > 0 && !selectedPair) {
        setSelectedPair(response.data[0]);
      }
    } catch (error) {
      setError('Failed to fetch forex pairs');
      console.error('Error fetching forex pairs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTrade = async () => {
    if (!selectedPair || !amount) return;

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/forex/trade`, {
        pair: selectedPair.symbol,
        amount: parseFloat(amount),
        type: tradeType,
      });

      if (response.data.success) {
        refreshBalance();
        setAmount('');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to execute trade');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchForexPairs();
  }, []);

  useEffect(() => {
    fetchForexPairs();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text style={styles.loadingText}>Loading forex data...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#00B4D8"
        />
      }
    >
      {/* Pairs Selection */}
      <Surface style={styles.pairsCard}>
        <Text style={styles.sectionTitle}>Forex Pairs</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.pairsScroll}
        >
          {forexPairs.map((pair) => (
            <Chip
              key={pair.symbol}
              selected={selectedPair?.symbol === pair.symbol}
              onPress={() => setSelectedPair(pair)}
              style={styles.pairChip}
              textStyle={{ color: selectedPair?.symbol === pair.symbol ? '#FFFFFF' : '#B0B0B0' }}
            >
              {pair.symbol}
            </Chip>
          ))}
        </ScrollView>
      </Surface>

      {/* Chart Section */}
      {selectedPair && (
        <Surface style={styles.chartCard}>
          <View style={styles.pairHeader}>
            <View>
              <Text style={styles.pairSymbol}>{selectedPair.symbol}</Text>
              <Text style={styles.pairName}>{selectedPair.name}</Text>
            </View>
            <View>
              <Text style={styles.pairPrice}>${selectedPair.price}</Text>
              <Text style={[
                styles.pairChange,
                { color: selectedPair.change >= 0 ? '#4CAF50' : '#FF4444' }
              ]}>
                {selectedPair.change >= 0 ? '+' : ''}{selectedPair.change}%
              </Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            <WebView
              source={{ html: generateTradingViewWidget(selectedPair.symbol) }}
              style={styles.webview}
              scrollEnabled={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          </View>
        </Surface>
      )}

      {/* Trading Section */}
      <Surface style={styles.tradingCard}>
        <Text style={styles.sectionTitle}>Trade Forex</Text>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{balance.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.tradeTypeContainer}>
          <Button
            mode={tradeType === 'BUY' ? 'contained' : 'outlined'}
            onPress={() => setTradeType('BUY')}
            style={[styles.tradeTypeButton, tradeType === 'BUY' && styles.buyButton]}
          >
            Buy
          </Button>
          <Button
            mode={tradeType === 'SELL' ? 'contained' : 'outlined'}
            onPress={() => setTradeType('SELL')}
            style={[styles.tradeTypeButton, tradeType === 'SELL' && styles.sellButton]}
          >
            Sell
          </Button>
        </View>

        <TextInput
          label="Amount (₹)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.input}
          mode="outlined"
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

        <Button
          mode="contained"
          onPress={handleTrade}
          style={styles.tradeButton}
          loading={loading}
          disabled={loading || !amount || !selectedPair}
          buttonColor={tradeType === 'BUY' ? '#4CAF50' : '#FF4444'}
        >
          {loading ? 'Processing...' : `${tradeType} ${selectedPair?.symbol}`}
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
  pairsCard: {
    backgroundColor: '#1E1E1E',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  pairsScroll: {
    flexGrow: 0,
  },
  pairChip: {
    marginRight: 8,
    backgroundColor: '#2A2A2A',
  },
  chartCard: {
    backgroundColor: '#1E1E1E',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  pairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pairSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pairName: {
    fontSize: 14,
    color: '#B0B0B0',
    marginTop: 4,
  },
  pairPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  pairChange: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
    marginTop: 4,
  },
  chartContainer: {
    height: 400,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  tradingCard: {
    backgroundColor: '#1E1E1E',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  balanceContainer: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tradeTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tradeTypeButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  buyButton: {
    backgroundColor: '#4CAF50',
  },
  sellButton: {
    backgroundColor: '#FF4444',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#2A2A2A',
  },
  tradeButton: {
    paddingVertical: 8,
  },
  errorText: {
    color: '#FF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ForexScreen; 