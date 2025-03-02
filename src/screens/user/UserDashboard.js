import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Text,
  Card,
  useTheme,
  Surface,
  IconButton,
  ActivityIndicator,
  Portal,
  Modal,
  Button,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useWallet } from "../../context/WalletContext";
import { API_URL } from "../../config/urls";
import { WebView } from "react-native-webview";
import { getAuthToken } from "../../config/axios";

const timeframes = [
  { value: "1", label: "1M" },
  { value: "5", label: "5M" },
  { value: "15", label: "15M" },
  { value: "60", label: "1H" },
  { value: "240", label: "4H" },
  { value: "D", label: "1D" },
];

const popularSymbols = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com" },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "JPM", name: "JPMorgan Chase" },
  { symbol: "BAC", name: "Bank of America" },
  { symbol: "XOM", name: "ExxonMobil" },
];

const marketIndices = [
  { symbol: "SPX", name: "S&P 500" },
  { symbol: "NDX", name: "Nasdaq 100" },
  { symbol: "DJI", name: "Dow Jones" },
];

const generateTradingViewWidget = (symbol, interval, containerId) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <style>
          body { 
            margin: 0;
            padding: 0;
            background-color: #121212;
          }
          #${containerId} { 
            height: 600px !important;
            width: 100% !important;
          }
          .tradingview-widget-container {
            height: 100% !important;
          }
        </style>
      </head>
      <body>
        <div id="${containerId}"></div>
        <script type="text/javascript">
          new TradingView.widget({
            "width": "100%",
            "height": "100%",
            "symbol": "${symbol}",
            "interval": "${interval}",
            "timezone": "Asia/Kolkata",
            "theme": "dark",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#1E1E1E",
            "enable_publishing": false,
            "hide_top_toolbar": false,
            "hide_legend": false,
            "save_image": true,
            "container_id": "${containerId}",
            "studies": [
              "Volume@tv-basicstudies",
              "MACD@tv-basicstudies",
              "RSI@tv-basicstudies"
            ],
            "overrides": {
              "mainSeriesProperties.candleStyle.upColor": "#4CAF50",
              "mainSeriesProperties.candleStyle.downColor": "#FF5252",
              "mainSeriesProperties.candleStyle.borderUpColor": "#4CAF50",
              "mainSeriesProperties.candleStyle.borderDownColor": "#FF5252",
              "mainSeriesProperties.candleStyle.wickUpColor": "#4CAF50",
              "mainSeriesProperties.candleStyle.wickDownColor": "#FF5252"
            }
          });
        </script>
      </body>
    </html>
  `;
};

const generateMarketOverview = () => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
        <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
        <style>
          body { 
            margin: 0;
            padding: 0;
            background-color: #121212;
          }
          #market-overview { 
            height: 500px !important;
            width: 100% !important;
          }
        </style>
      </head>
      <body>
        <div id="market-overview"></div>
        <script type="text/javascript">
          new TradingView.MediumWidget({
            "container_id": "market-overview",
            "symbols": [
              // US Market Indices
            
              // US Tech Giants
              ["Apple", "AAPL"],
              ["Microsoft", "MSFT"],
              ["Google", "GOOGL"],
              ["Amazon", "AMZN"],
              ["Meta", "META"],
              ["NVIDIA", "NVDA"],
              
              // US Banking & Finance
              ["JPMorgan", "JPM"],
              ["Bank of America", "BAC"],
              ["Goldman Sachs", "GS"],
                ["S&P 500", "SPX"],
              ["NASDAQ", "NDX"],
              ["Dow Jones", "DJI"],
                    
              // US Energy & Industry
              ["Tesla", "TSLA"],
              ["ExxonMobil", "XOM"],
              ["Boeing", "BA"]
            ],
            "chartOnly": false,
            "width": "100%",
            "height": "100%",
            "locale": "en",
            "colorTheme": "dark",
            "gridLineColor": "#2A2A2A",
            "trendLineColor": "#1976D2",
            "fontColor": "#FFFFFF",
            "underLineColor": "#F0F0F0",
            "isTransparent": true,
            "autosize": true,
            "showFloatingTooltip": true,
            "scalePosition": "right",
            "scaleMode": "Normal",
            "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
            "noTimeScale": false,
            "valuesTracking": "1",
            "changeMode": "price-and-percent"
          });
        </script>
      </body>
    </html>
  `;
};

const UserDashboard = ({ navigation }) => {
  const theme = useTheme();
  const { balance, isLoading: walletLoading } = useWallet();
  const [selectedTimeframe, setSelectedTimeframe] = useState("60");
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState(null);
  const [marketStats, setMarketStats] = useState({
    totalValue: 0,
    totalPnL: 0,
    dayChange: 0,
  });
  const [holdings, setHoldings] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchMarketStats();
    fetchStockData();
    fetchHoldings();
    fetchRecentTransactions();
  }, [selectedSymbol]);

  const fetchMarketStats = async () => {
    try {
      const response = await fetch(`${API_URL}/portfolio/stats`);
      const data = await response.json();
      setMarketStats(data);
    } catch (error) {
      console.error("Error fetching market stats:", error);
    }
  };

  const fetchStockData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/stocks/quote/${selectedSymbol}`);
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHoldings = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/portfolio/holdings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setHoldings(data.holdings);
    } catch (error) {
      console.error("Error fetching holdings:", error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`${API_URL}/portfolio/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // The backend returns the transactions directly, not wrapped in a transactions property
      setRecentTransactions((data || []).slice(0, 5)); // Get last 5 transactions
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setRecentTransactions([]); // Set empty array on error
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: "#121212" }]}>
      {/* Market Stats */}
      <View style={styles.statsContainer}>
        <Surface style={[styles.statCard, { backgroundColor: "#1E1E1E" }]}>
          <MaterialCommunityIcons name='wallet' size={24} color='#00B4D8' />
          <Text style={styles.statLabel}>Balance</Text>
          {walletLoading ? (
            <ActivityIndicator size='small' color='#00B4D8' />
          ) : (
            <Text style={styles.statValue}>
              ₹{(balance || 0).toLocaleString("en-IN")}
            </Text>
          )}
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: "#1E1E1E" }]}>
          <MaterialCommunityIcons name='chart-line' size={24} color='#00B4D8' />
          <Text style={styles.statLabel}>Portfolio Value</Text>
          <Text style={styles.statValue}>
            ₹{(marketStats.totalValue || 0).toLocaleString("en-IN")}
          </Text>
        </Surface>

        <Surface
          style={[
            styles.statCard,
            {
              backgroundColor: "#1E1E1E",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={marketStats.overallPnL >= 0 ? "trending-up" : "trending-down"}
            size={24}
            color={marketStats.overallPnL >= 0 ? "#4CAF50" : "#FF5252"}
          />
          <Text style={styles.statLabel}>Overall P/L</Text>
          <Text
            style={[
              styles.statValue,
              { color: marketStats.overallPnL >= 0 ? "#4CAF50" : "#FF5252" },
            ]}
          >
            {marketStats.overallPnL >= 0 ? "+" : ""}
            {marketStats.overallPnL}%
          </Text>
        </Surface>
      </View>

      {/* Chart Card */}
      <Card style={styles.chartCard}>
        <Card.Content>
          {/* Symbol Selection */}
          <View style={styles.symbolSelectionContainer}>
            <Text style={styles.sectionTitle}>Popular Stocks</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.symbolScroll}
            >
              {popularSymbols.map((stock) => (
                <TouchableOpacity
                  key={stock.symbol}
                  onPress={() => setSelectedSymbol(stock.symbol)}
                  style={[
                    styles.symbolChip,
                    selectedSymbol === stock.symbol &&
                      styles.selectedSymbolChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.symbolChipText,
                      selectedSymbol === stock.symbol &&
                        styles.selectedSymbolChipText,
                    ]}
                  >
                    {stock.symbol}
                  </Text>
                  <Text
                    style={[
                      styles.symbolCompanyName,
                      selectedSymbol === stock.symbol &&
                        styles.selectedSymbolChipText,
                    ]}
                  >
                    {stock.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Timeframe Selection */}
          <View style={styles.timeframeContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.timeframeScroll}
            >
              {timeframes.map((tf) => (
                <TouchableOpacity
                  key={tf.value}
                  onPress={() => setSelectedTimeframe(tf.value)}
                  style={[
                    styles.timeframeChip,
                    selectedTimeframe === tf.value &&
                      styles.selectedTimeframeChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeframeText,
                      selectedTimeframe === tf.value &&
                        styles.selectedTimeframeText,
                    ]}
                  >
                    {tf.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* TradingView Chart */}
          <View style={styles.chartContainer}>
          <WebView
            source={{
                html: generateTradingViewWidget(
                  selectedSymbol,
                  selectedTimeframe,
                  "tradingview_chart",
                ),
              }}
              style={{ height: 600, backgroundColor: "#121212" }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              scrollEnabled={false}
              renderLoading={() => (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size='large' color='#00B4D8' />
                </View>
              )}
            />
          </View>

          {/* Market Overview */}
          <View style={styles.overviewContainer}>
            <Text style={styles.sectionTitle}>Market Overview</Text>
            <View style={styles.overviewWidget}>
              <WebView
                source={{ html: generateMarketOverview() }}
                style={{ height: 500, backgroundColor: "#121212" }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                scrollEnabled={false}
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color='#00B4D8' />
                  </View>
                )}
              />
            </View>
          </View>

          {/* Portfolio Section */}
          <Card style={[styles.sectionCard, { backgroundColor: "#1E1E1E" }]}>
            <Card.Title
              title='Your Portfolio'
              titleStyle={{ color: "#FFFFFF" }}
              right={(props) => (
                <IconButton
                  {...props}
                  icon='chevron-right'
                  iconColor='#FFFFFF'
                  onPress={() => navigation.navigate("Portfolio")}
                />
              )}
            />
            <Card.Content>
              {holdings.length === 0 ? (
                <Text style={styles.emptyText}>No holdings found</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {holdings.map((holding, index) => {
                    // Calculate PnL percentage
                    const currentValue =
                      holding.currentPrice * holding.quantity;
                    const investmentValue =
                      holding.averageBuyPrice * holding.quantity;
                    const pnlPercentage =
                      ((currentValue - investmentValue) / investmentValue) *
                      100;

                    return (
                      <Surface key={index} style={styles.holdingCard}>
                        <Text style={styles.symbolText}>{holding.symbol}</Text>
                        <Text style={styles.quantityText}>
                          {holding.quantity} shares
                        </Text>
                        <Text
                          style={[
                            styles.pnlText,
                            {
                              color: pnlPercentage >= 0 ? "#4CAF50" : "#FF4444",
                            },
                          ]}
                        >
                          {pnlPercentage >= 0 ? "+" : ""}
                          {pnlPercentage.toFixed(2)}%
                        </Text>
                      </Surface>
                    );
                  })}
                </ScrollView>
              )}
        </Card.Content>
      </Card>
      
          {/* Recent Transactions Section */}
          <Card style={[styles.sectionCard, { backgroundColor: "#1E1E1E" }]}>
            <Card.Title
              title='Recent Transactions'
              titleStyle={{ color: "#FFFFFF" }}
              right={(props) => (
                <IconButton
                  {...props}
                  icon='chevron-right'
                  iconColor='#FFFFFF'
                  onPress={() => navigation.navigate("Transactions")}
                />
              )}
            />
        <Card.Content>
              {recentTransactions.length === 0 ? (
                <Text style={styles.emptyText}>No recent transactions</Text>
              ) : (
                recentTransactions.map((transaction, index) => (
                  <Surface
                    key={index}
                    style={[
                      styles.transactionCard,
                      { backgroundColor: "#2A2A2A" },
                    ]}
                  >
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionSymbol}>
                        {transaction.symbol}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text
                        style={[
                          styles.transactionType,
                          {
                            color:
                              transaction.type === "BUY"
                                ? "#4CAF50"
                                : "#FF4444",
                          },
                        ]}
                      >
                        {transaction.type}
                      </Text>
                      <Text style={styles.transactionAmount}>
                        ₹{transaction.total.toLocaleString("en-IN")}
                      </Text>
                    </View>
                  </Surface>
                ))
              )}
        </Card.Content>
      </Card>
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    flexWrap: "wrap",
  },
  statCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "31%",
    backgroundColor: "#1E1E1E",
  },
  statLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
    color: "#FFFFFF",
  },
  chartCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: "#1E1E1E",
    overflow: "hidden",
  },
  symbolSelectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
    color: "#FFFFFF",
  },
  symbolScroll: {
    flexGrow: 0,
  },
  symbolChip: {
    backgroundColor: "#2D2D2D",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#3D3D3D",
    minWidth: 100,
  },
  selectedSymbolChip: {
    backgroundColor: "#00B4D8",
    borderColor: "#00B4D8",
  },
  symbolChipText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  selectedSymbolChipText: {
    color: "#FFFFFF",
  },
  symbolCompanyName: {
    fontSize: 12,
    color: "#AAAAAA",
    marginTop: 4,
  },
  timeframeContainer: {
    marginBottom: 16,
  },
  timeframeScroll: {
    flexGrow: 0,
  },
  timeframeChip: {
    backgroundColor: "#2D2D2D",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#3D3D3D",
  },
  selectedTimeframeChip: {
    backgroundColor: "#00B4D8",
    borderColor: "#00B4D8",
  },
  timeframeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  selectedTimeframeText: {
    color: "#FFFFFF",
  },
  chartContainer: {
    height: 600,
    backgroundColor: "#121212",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  overviewContainer: {
    marginTop: 16,
  },
  overviewWidget: {
    height: 500,
    backgroundColor: "#121212",
    borderRadius: 8,
    overflow: "hidden",
  },
  loadingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121212",
  },
  sectionCard: {
    borderWidth: 1,
    borderColor: "#3D3D3D",
    marginVertical: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  holdingCard: {
    padding: 16,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
    minWidth: 150,
  },
  symbolText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  quantityText: {
    color: "#B0B0B0",
    fontSize: 14,
    marginTop: 4,
  },
  pnlText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  emptyText: {
    color: "#B0B0B0",
    textAlign: "center",
    padding: 16,
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionSymbol: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionDate: {
    color: "#B0B0B0",
    fontSize: 12,
    marginTop: 4,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "bold",
  },
  transactionAmount: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 4,
  },
});

export default UserDashboard;
