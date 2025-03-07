import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Text,
  Surface,
  Chip,
  Button,
  TextInput,
  SegmentedButtons,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CandleChart from "./CandleChart";
import { WebView } from "react-native-webview";

const ForexDetails = ({ navigation, route }) => {
  const { forex } = route.params;
  const [timeFrame, setTimeFrame] = useState("1mo");
  const [tradeType, setTradeType] = useState("BUY");
  const [amount, setAmount] = useState("");

  const timeFrames = [
    { label: "5Y", value: "5y", interval: "W" },  // Weekly for 5Y
    { label: "1Y", value: "1y", interval: "W" },  // Weekly for 1Y
    { label: "6M", value: "6mo", interval: "D" }, // Daily for 6M
    { label: "1M", value: "1mo", interval: "240" }, // 4H for 1M
    { label: "5D", value: "5d", interval: "60" },  // 1H for 5D
    { label: "1D", value: "1d", interval: "15" },  // 15min for 1D
  ];

  const handleTrade = () => {
    // Navigate to trade confirmation or execute trade
    navigation.navigate("ForexTrade", {
      forex,
      type: tradeType,
      amount: parseFloat(amount),
    });
  };

  const generateTradingViewWidget = () => {
    const formattedSymbol = forex.symbol.replace('/', '');
    const currentTimeFrame = timeFrames.find(tf => tf.value === timeFrame);
    
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              margin: 0; 
              background-color: #1E1E1E;
              overflow: hidden;
            }
            .tradingview-widget-container {
              height: 100%;
            }
          </style>
        </head>
        <body>
          <div class="tradingview-widget-container">
            <div id="tradingview_widget"></div>
            <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
            <script type="text/javascript">
              new TradingView.widget({
                "autosize": true,
                "symbol": "FX:${formattedSymbol}",
                "interval": "${currentTimeFrame.interval}",
                "range": "${timeFrame}",
                "timezone": "exchange",
                "theme": "dark",
                "style": "1",
                "locale": "en",
                "enable_publishing": false,
                "withdateranges": true,
                "hide_side_toolbar": false,
                "allow_symbol_change": false,
                "details": true,
                "hotlist": true,
                "calendar": true,
                "show_popup_button": true,
                "popup_width": "1000",
                "popup_height": "650",
                "container_id": "tradingview_widget",
                "hide_volume": false,
                "backgroundColor": "#1E1E1E",
                "gridColor": "#2A2A2A"
              });
            </script>
          </div>
        </body>
      </html>
    `;
  };

  // Force WebView refresh when timeFrame changes
  const [key, setKey] = useState(0);
  
  const handleTimeFrameChange = (newTimeFrame) => {
    setTimeFrame(newTimeFrame);
    setKey(prevKey => prevKey + 1); // Force WebView refresh
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.headerCard} elevation={2}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.symbol}>{forex.symbol}</Text>
            <Text style={styles.name}>{forex.name}</Text>
          </View>
          <Chip
            style={[styles.categoryChip]}
            textStyle={{ color: "#90CAF9" }}
          >
            {forex.category}
          </Chip>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {forex.price.toFixed(4)}
          </Text>
          <Text
            style={[
              styles.change,
              { color: forex.changePercent >= 0 ? "#4CAF50" : "#FF4444" },
            ]}
          >
            {forex.changePercent >= 0 ? "+" : ""}
            {forex.changePercent.toFixed(2)}%
          </Text>
        </View>
      </Surface>

      <Surface style={styles.chartCard} elevation={2}>
        <View style={styles.timeFrameContainer}>
          {timeFrames.map((tf) => (
            <TouchableOpacity
              key={tf.value}
              style={[
                styles.timeFrameButton,
                timeFrame === tf.value && styles.timeFrameButtonActive,
              ]}
              onPress={() => handleTimeFrameChange(tf.value)}
            >
              <Text
                style={[
                  styles.timeFrameText,
                  timeFrame === tf.value && styles.timeFrameTextActive,
                ]}
              >
                {tf.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.chartContainer}>
          <WebView
            key={key}
            source={{ html: generateTradingViewWidget() }}
            style={styles.webview}
            scrollEnabled={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
          />
        </View>
      </Surface>

      <Surface style={styles.tradeCard} elevation={2}>
        <Text style={styles.tradeTitle}>Trade {forex.symbol}</Text>
        
        <SegmentedButtons
          value={tradeType}
          onValueChange={setTradeType}
          buttons={[
            { value: 'BUY', label: 'Buy', style: styles.buyButton },
            { value: 'SELL', label: 'Sell', style: styles.sellButton },
          ]}
          style={styles.tradeTypeButtons}
        />

        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={styles.amountInput}
          mode="outlined"
        />

        <Button
          mode="contained"
          onPress={handleTrade}
          style={[
            styles.tradeButton,
            { backgroundColor: tradeType === 'BUY' ? '#4CAF50' : '#FF4444' }
          ]}
          disabled={!amount || parseFloat(amount) <= 0}
        >
          {tradeType} {forex.symbol}
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  headerCard: {
    backgroundColor: "#1E1E1E",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  symbol: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 14,
    color: "#B0B0B0",
    marginTop: 4,
  },
  categoryChip: {
    backgroundColor: "#1A237E20",
    borderRadius: 16,
  },
  priceContainer: {
    marginTop: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  change: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: "#1E1E1E",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    overflow: 'hidden',
    height: 500,
  },
  timeFrameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeFrameButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#2A2A2A",
  },
  timeFrameButtonActive: {
    backgroundColor: "#00B4D8",
  },
  timeFrameText: {
    color: "#B0B0B0",
    fontSize: 12,
    fontWeight: "500",
  },
  timeFrameTextActive: {
    color: "#FFFFFF",
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  tradeCard: {
    backgroundColor: "#1E1E1E",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  tradeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  tradeTypeButtons: {
    marginBottom: 16,
  },
  buyButton: {
    backgroundColor: "#4CAF5020",
  },
  sellButton: {
    backgroundColor: "#FF444420",
  },
  amountInput: {
    backgroundColor: "#2A2A2A",
    marginBottom: 16,
  },
  tradeButton: {
    marginTop: 8,
  },
});

export default ForexDetails; 