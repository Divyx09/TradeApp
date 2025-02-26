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
  { value: "4h", label: "4H" },
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
  { symbol: "JPM", name: "JPMorgan Chase" }
];

const marketIndices = [
  { symbol: "SPX", name: "S&P 500" },
  { symbol: "NDX", name: "Nasdaq 100" },
  { symbol: "DJI", name: "Dow Jones" },
  { symbol: "FTSE", name: "FTSE 100" },
  { symbol: "DAX", name: "Germany DAX" }
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
        <body>
          <div class="tradingview-widget-container">
            <script type="text/javascript" src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js" async>
            {
              "width": "100%",
              "height": "100%",
              "autosize": true,
              "symbol": "${selectedSymbol}",
              "interval": "D",
              "timezone": "Asia/Kolkata",
              "theme": "light",
              "locale": "en",
              "enable_publishing": false,
              "allow_symbol_change": true,
              "hide_top_toolbar": false,
              "save_image": false,
              "calendar": false,
              "range": "${selectedTimeframe}",
              "support_host": "https://www.tradingview.com"
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

      {/* Chart Section */}
      <Card style={styles.chartCard}>
        <Card.Content>
          <View style={styles.chartHeader}>
            <View style={styles.symbolContainer}>
              <Text variant='titleLarge' style={styles.symbolText}>
                {selectedSymbol.replace(".NS", "")}
              </Text>
              {stockData && (
                <Text
                  style={[
                    styles.priceText,
                    { color: stockData.change >= 0 ? "#4CAF50" : "#FF4444" },
                  ]}
                >
                  ₹{stockData.price?.toFixed(2)} (
                  {stockData.changePercent?.toFixed(2)}%)
                </Text>
              )}
            </View>
            <IconButton
              icon='fullscreen'
              onPress={() => setShowStockDetails(true)}
            />
          </View>

          <View style={styles.timeframeContainer}>
            <Text
              variant='bodyMedium'
              style={{ marginBottom: 8, fontSize: 20, fontWeight: "bold" }}
            >
              Timeframe:
            </Text>
            <SegmentedButtons
              value={selectedTimeframe}
              onValueChange={setSelectedTimeframe}
              buttons={timeframes.map((tf) => ({
                value: tf.value,
                label: tf.label,
              }))}
              style={styles.timeframeButtons}
            />
          </View>

          <View style={styles.chartContainer}>
            {loading ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
              <WebView
                source={{ html: generateTradingViewWidget() }}
                style={styles.chart}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                  <ActivityIndicator style={styles.loader} />
                )}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn("WebView error: ", nativeEvent);
                }}
                renderError={(errorDomain, errorCode, errorDesc) => (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error loading chart</Text>
                    <Button
                      mode='contained'
                      onPress={() => setSelectedTimeframe(selectedTimeframe)}
                    >
                      Retry
                    </Button>
                  </View>
                )}
              />
            )}
          </View>

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
                    {stock.symbol.replace(".NS", "")}
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

          {/* Market Indices */}
          <View style={styles.symbolSelectionContainer}>
            <Text variant='bodyMedium' style={styles.sectionTitle}>
              Market Indices
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.symbolScroll}
            >
              {marketIndices.map((index) => (
                <TouchableOpacity
                  key={index.symbol}
                  onPress={() => setSelectedSymbol(index.symbol)}
                  style={[
                    styles.symbolChip,
                    selectedSymbol === index.symbol &&
                      styles.selectedSymbolChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.symbolChipText,
                      selectedSymbol === index.symbol &&
                        styles.selectedSymbolChipText,
                    ]}
                  >
                    {index.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    marginVertical: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  symbolContainer: {
    flex: 1,
  },
  symbolText: {
    fontWeight: "bold",
  },
  priceText: {
    fontSize: 16,
    marginTop: 4,
  },
  timeframeContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
  },
  timeframeButtons: {
    flex: 1,
    marginHorizontal: 8,
  },
  chartContainer: {
    height: 400,
    backgroundColor: "#f5f5f5",
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    marginBottom: 8,
    color: "#FF4444",
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
  symbolSelectionContainer: {
    marginTop: 16,
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
});

export default UserDashboard;
