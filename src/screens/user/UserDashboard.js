import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  useTheme,
  Surface,
  IconButton,
  SegmentedButtons,
  ActivityIndicator,
  Portal,
  Modal,
  Button,
} from "react-native-paper";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useWallet } from "../../context/WalletContext";
import { API_URL } from "../../config/urls";

const timeframes = [
  { value: "1m", label: "1M" },
  { value: "5m", label: "5M" },
  { value: "15m", label: "15M" },
  { value: "1h", label: "1H" },
  { value: "1d", label: "1D" },
];

const popularSymbols = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "AMZN", name: "Amazon.com" },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "JPM", name: "JPMorgan Chase" },
];

const marketIndices = [
  { symbol: "SPX", name: "S&P 500" },
  { symbol: "NDX", name: "Nasdaq 100" },
  { symbol: "DJI", name: "Dow Jones" },
  { symbol: "FTSE", name: "FTSE 100" },
  { symbol: "DAX", name: "Germany DAX" },
];

const UserDashboard = ({ navigation }) => {
  const theme = useTheme();
  const { balance, isLoading: walletLoading } = useWallet();
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h");
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStockDetails, setShowStockDetails] = useState(false);
  const [marketStats, setMarketStats] = useState({
    totalValue: 0,
    todaysPnL: 0,
    overallPnL: 0,
    stockCount: 0,
  });

  useEffect(() => {
    fetchMarketStats();
    fetchStockData();
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

  const generateTradingViewWidget = () => {
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=0.7">
        </head>
        <body>
          <div class="tradingview-widget-container">
            <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" async>
            {
              "width": "100%",
              "height": "100%",
              "autosize": true,
              "symbol": "${selectedSymbol}",
              "interval": "${selectedTimeframe}",
              "timezone": "Asia/Kolkata",
              "theme": "light",
              "style": "5",
              "locale": "en",
              "enable_publishing": false,
              "allow_symbol_change": true,
              "hide_top_toolbar": false,
              "hide_legend": false,
              "save_image": true,
              "hide_volume": false,
            }
            </script>
          </div>
        </body>
      </html>
    `;
  };

  const renderStockDetailsModal = () => (
    <Portal>
      <Modal
        visible={showStockDetails}
        onDismiss={() => setShowStockDetails(false)}
        contentContainerStyle={styles.modalContent}
      >
        {stockData && (
          <ScrollView>
            <Text style={styles.modalTitle}>{stockData.companyName}</Text>
            <Text style={styles.modalSymbol}>{stockData.symbol}</Text>

            <View style={styles.modalGrid}>
              <View style={styles.modalGridItem}>
                <Text style={styles.gridLabel}>Open</Text>
                <Text style={styles.gridValue}>
                  ₹{stockData.open?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.gridLabel}>High</Text>
                <Text style={styles.gridValue}>
                  ₹{stockData.dayHigh?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.gridLabel}>Low</Text>
                <Text style={styles.gridValue}>
                  ₹{stockData.dayLow?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.gridLabel}>Volume</Text>
                <Text style={styles.gridValue}>
                  {stockData.volume?.toLocaleString()}
                </Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.gridLabel}>52W High</Text>
                <Text style={styles.gridValue}>
                  ₹{stockData.high52Week?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.gridLabel}>52W Low</Text>
                <Text style={styles.gridValue}>
                  ₹{stockData.low52Week?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.gridLabel}>P/E Ratio</Text>
                <Text style={styles.gridValue}>
                  {stockData.pe?.toFixed(2) || "N/A"}
                </Text>
              </View>
              <View style={styles.modalGridItem}>
                <Text style={styles.gridLabel}>Market Cap</Text>
                <Text style={styles.gridValue}>
                  {(stockData.marketCap / 1e9).toFixed(2)}B
                </Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode='contained'
                onPress={() => navigation.navigate("buy", { stock: stockData })}
                style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
              >
                Buy
              </Button>
              <Button
                mode='contained'
                onPress={() =>
                  navigation.navigate("sell", { stock: stockData })
                }
                style={[styles.actionButton, { backgroundColor: "#FF5252" }]}
              >
                Sell
              </Button>
            </View>
          </ScrollView>
        )}
      </Modal>
    </Portal>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Market Stats */}
      <View style={styles.statsContainer}>
        <Surface
          style={[styles.statCard, { backgroundColor: theme.colors.primary }]}
        >
          <MaterialCommunityIcons name='wallet' size={24} color='#fff' />
          <Text style={styles.statLabel}>Balance</Text>
          {walletLoading ? (
            <ActivityIndicator size='small' color='#fff' />
          ) : (
            <Text style={styles.statValue}>
              ₹{(balance || 0).toLocaleString("en-IN")}
            </Text>
          )}
        </Surface>

        <Surface style={[styles.statCard, { backgroundColor: "#673AB7" }]}>
          <MaterialCommunityIcons name='chart-line' size={24} color='#fff' />
          <Text style={styles.statLabel}>Portfolio Value</Text>
          <Text style={styles.statValue}>
            ₹{(marketStats.totalValue || 0).toLocaleString("en-IN")}
          </Text>
        </Surface>

        <Surface
          style={[
            styles.statCard,
            {
              backgroundColor:
                marketStats.overallPnL >= 0 ? "#4CAF50" : "#FF5252",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={marketStats.overallPnL >= 0 ? "trending-up" : "trending-down"}
            size={24}
            color='#fff'
          />
          <Text style={styles.statLabel}>Overall P/L</Text>
          <Text style={styles.statValue}>
            {marketStats.overallPnL >= 0 ? "+" : ""}
            {marketStats.overallPnL}%
          </Text>
        </Surface>
      </View>

      {/* Market Indices */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.indicesScroll}
      >
        {marketIndices.map((index) => (
          <Surface
            key={index.symbol}
            style={[
              styles.indexCard,
              { backgroundColor: theme.dark ? "#2D2D2D" : "#fff" },
            ]}
          >
            <Text style={styles.indexName}>{index.name}</Text>
            <Text
              style={[
                styles.indexValue,
                { color: Math.random() > 0.5 ? "#4CAF50" : "#FF5252" },
              ]}
            >
              {Math.random() > 0.5 ? "+" : "-"}
              {(Math.random() * 2).toFixed(2)}%
            </Text>
          </Surface>
        ))}
      </ScrollView>

      {/* Chart Card */}
      <Card style={styles.chartCard}>
        <Card.Content>
          {/* Symbol Selection */}
          <View style={styles.symbolSelectionContainer}>
            <Text variant='bodyMedium' style={styles.sectionTitle}>
              Popular Stocks
            </Text>
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

          {/* Chart */}
          <View style={styles.chartContainer}>
            {loading ? (
              <ActivityIndicator
                style={styles.loader}
                size='large'
                color={theme.colors.primary}
              />
            ) : (
              <WebView
                source={{ html: generateTradingViewWidget() }}
            style={styles.chart}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <ActivityIndicator
                    style={styles.loader}
                    size='large'
                    color={theme.colors.primary}
                  />
                )}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn("WebView error: ", nativeEvent);
                }}
              />
            )}
          </View>

          {/* Market Overview Widget */}
          <View style={styles.overviewContainer}>
            <Text variant='bodyMedium' style={styles.sectionTitle}>
              Market Overview
            </Text>
            <View style={styles.overviewWidget}>
          <WebView
            source={{
              html: `
                    <html>
                      <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                          body {
                            margin: 0;
                            padding: 0;
                            background-color: #ffffff;
                          }
                          .tradingview-widget-container {
                            height: 100%;
                            width: 100%;
                          }
                        </style>
                      </head>
                      <body>
                <div class="tradingview-widget-container">
                          <div class="tradingview-widget-container__widget"></div>
                          <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js" async>
                          {
                            "symbols": [
                              ["Apple", "AAPL|1D"],
                              ["Google", "GOOGL|1D"],
                              ["Microsoft", "MSFT|1D"]
                            ],
                            "chartOnly": false,
                    "width": "100%",
                            "height": "100%",
                    "locale": "en",
                            "colorTheme": "light",
                            "autosize": true,
                            "showVolume": false,
                            "showMA": false,
                            "hideDateRanges": false,
                            "hideMarketStatus": false,
                            "hideSymbolLogo": false,
                            "scalePosition": "right",
                            "scaleMode": "Normal",
                            "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
                            "fontSize": "10",
                            "noTimeScale": false,
                            "valuesTracking": "1",
                            "changeMode": "price-and-percent",
                            "chartType": "area",
                            "maLineColor": "#2962FF",
                            "maLineWidth": 1,
                            "maLength": 9,
                            "headerFontSize": "medium",
                            "lineWidth": 2,
                            "lineType": 0,
                            "dateRanges": [
                              "1d|1",
                              "1m|30",
                              "3m|60",
                              "12m|1D",
                              "60m|1W",
                              "all|1M"
                            ]
                          }
                  </script>
                </div>
                      </body>
                    </html>
                  `
                }}
                style={styles.overviewChart}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <ActivityIndicator
                    style={styles.loader}
                    size='large'
                    color={theme.colors.primary}
                  />
                )}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {/* Portfolio Summary */}
      <Card
        style={styles.portfolioCard}
        onPress={() => navigation.navigate("portfolio")}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant='titleLarge'>Portfolio Summary</Text>
            <IconButton icon='chevron-right' />
          </View>
          <View style={styles.portfolioStats}>
            <View style={styles.portfolioStat}>
              <Text style={styles.portfolioStatLabel}>Total Value</Text>
              <Text style={styles.portfolioStatValue}>
                ₹{(marketStats.totalValue || 0).toLocaleString("en-IN")}
              </Text>
            </View>
            <View style={styles.portfolioStat}>
              <Text style={styles.portfolioStatLabel}>Today's P/L</Text>
              <Text
                style={[
                  styles.portfolioStatValue,
                  {
                    color:
                      (marketStats.todaysPnL || 0) >= 0 ? "#4CAF50" : "#FF5252",
                  },
                ]}
              >
                {(marketStats.todaysPnL || 0) >= 0 ? "+" : ""}₹
                {Math.abs(marketStats.todaysPnL || 0).toLocaleString("en-IN")}
              </Text>
            </View>
          </View>
          <View style={styles.portfolioStats}>
            <View style={styles.portfolioStat}>
              <Text style={styles.portfolioStatLabel}>Stocks Held</Text>
              <Text style={styles.portfolioStatValue}>
                {marketStats.stockCount}
              </Text>
            </View>
            <View style={styles.portfolioStat}>
              <Text style={styles.portfolioStatLabel}>Overall Return</Text>
              <Text
                style={[
                  styles.portfolioStatValue,
                  {
                    color: marketStats.overallPnL >= 0 ? "#4CAF50" : "#FF5252",
                  },
                ]}
              >
                {marketStats.overallPnL >= 0 ? "+" : ""}
                {marketStats.overallPnL}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {/* Recent Transactions */}
      <Card
        style={styles.transactionsCard}
        onPress={() => navigation.navigate("recentTransection")}
      >
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant='titleLarge'>Recent Transactions</Text>
            <IconButton icon='chevron-right' />
          </View>
          <View style={styles.transactionList}>
            <View style={styles.transaction}>
              <MaterialCommunityIcons
                name='arrow-top-right'
                size={24}
                color='#4CAF50'
              />
              <View style={styles.transactionInfo}>
                <Text>Bought AAPL</Text>
                <Text style={styles.transactionDate}>Today, 2:30 PM</Text>
              </View>
              <Text style={styles.transactionAmount}>₹12,345</Text>
            </View>
            <View style={styles.transaction}>
              <MaterialCommunityIcons
                name='arrow-bottom-right'
                size={24}
                color='#FF5252'
              />
              <View style={styles.transactionInfo}>
                <Text>Sold GOOGL</Text>
                <Text style={styles.transactionDate}>Yesterday, 4:15 PM</Text>
              </View>
              <Text style={styles.transactionAmount}>₹15,678</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {renderStockDetailsModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  },
  statLabel: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  indicesScroll: {
    marginBottom: 16,
  },
  indexCard: {
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    elevation: 2,
    minWidth: 120,
  },
  indexName: {
    fontSize: 12,
    opacity: 0.7,
  },
  indexValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  chartCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
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
  },
  symbolScroll: {
    flexGrow: 0,
  },
  symbolChip: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minWidth: 100,
  },
  selectedSymbolChip: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  symbolChipText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  selectedSymbolChipText: {
    color: "#fff",
  },
  symbolCompanyName: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  timeframeContainer: {
    marginBottom: 16,
    alignItems: "center",
    marginHorizontal: 0,
  },
  timeframeScroll: {
    flexGrow: 0,
  },
  timeframeChip: {
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedTimeframeChip: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  timeframeText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  selectedTimeframeText: {
    color: "#fff",
  },
  chartContainer: {
    height: 400,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
  },
  chart: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  portfolioCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  portfolioStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  portfolioStat: {
    alignItems: "center",
  },
  portfolioStatLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  portfolioStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  transactionsCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  transactionList: {
    marginTop: 16,
  },
  transaction: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  transactionAmount: {
    fontWeight: "bold",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  modalSymbol: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 16,
  },
  modalGridItem: {
    width: "50%",
    padding: 8,
  },
  gridLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  overviewContainer: {
    marginTop: 16,
  },
  overviewWidget: {
    height: 400,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
  },
  overviewChart: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default UserDashboard;
