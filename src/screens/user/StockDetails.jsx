import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Text, Surface, Chip, Button } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import CandleChart from "./CandleChart";

const StockDetails = ({ navigation, route }) => {
  const { stock } = route.params;
  const [timeFrame, setTimeFrame] = useState("1mo");

  const timeFrames = [
    { label: "5Y", value: "5y" },
    { label: "1Y", value: "1y" },
    { label: "6M", value: "6mo" },
    { label: "1M", value: "1mo" },
    { label: "5D", value: "5d" },
    { label: "1D", value: "1d" },
  ];

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.headerCard} elevation={2}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.symbol}>{stock.symbol.replace(".NS", "")}</Text>
            <Text style={styles.companyName}>{stock.companyName}</Text>
          </View>
          <Chip
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  stock.category === "Indian" ? "#E3F2FD20" : "#FFF3E020",
              },
            ]}
          >
            <Text
              style={{
                color: stock.category === "Indian" ? "#90CAF9" : "#FFB74D",
              }}
            >
              {stock.category}
            </Text>
          </Chip>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {stock.category === "Indian" ? "₹" : "$"}
            {stock.price?.toLocaleString(
              stock.category === "Indian" ? "en-IN" : "en-US",
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}
          </Text>
          <Text
            style={[
              styles.change,
              { color: stock.changePercent >= 0 ? "#4CAF50" : "#FF4444" },
            ]}
          >
            {stock.changePercent >= 0 ? "+" : ""}
            {stock.changePercent?.toFixed(2)}%
          </Text>
        </View>
      </Surface>

      <Surface style={styles.statsCard} elevation={2}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Open</Text>
            <Text style={styles.statValue}>₹{stock.open?.toFixed(2)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>High</Text>
            <Text style={styles.statValue}>₹{stock.dayHigh?.toFixed(2)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Low</Text>
            <Text style={styles.statValue}>₹{stock.dayLow?.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Volume</Text>
            <Text style={styles.statValue}>
              {stock.volume?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Market Cap</Text>
            <Text style={styles.statValue}>
              ₹{(stock.marketCap / 1e9).toFixed(2)}B
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>P/E Ratio</Text>
            <Text style={styles.statValue}>{stock.pe?.toFixed(2) || "-"}</Text>
          </View>
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
              onPress={() => setTimeFrame(tf.value)}
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
          <Text style={styles.chartSymbol}>
            {stock.symbol} • {timeFrame.toUpperCase()}
          </Text>
          <CandleChart symbol={stock.symbol} timeFrame={timeFrame} />
        </View>
      </Surface>

      <View style={styles.actionButtons}>
        <Button
          mode='contained'
          onPress={() => navigation.navigate("Buy", { stock })}
          style={[styles.actionButton, styles.buyButton]}
          icon='cart'
        >
          Buy
        </Button>
        <Button
          mode='contained'
          onPress={() => navigation.navigate("Sell", { stock })}
          style={[styles.actionButton, styles.sellButton]}
          icon='cash'
        >
          Sell
        </Button>
      </View>
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
  companyName: {
    fontSize: 14,
    color: "#B0B0B0",
    marginTop: 4,
  },
  categoryChip: {
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
  statsCard: {
    backgroundColor: "#1E1E1E",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    color: "#B0B0B0",
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  chartCard: {
    backgroundColor: "#1E1E1E",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
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
    borderRadius: 8,
    width: "100%",
    height: 420,
    // backgroundColor: "#2A2A2A",
    padding: 16,
  },
  chartSymbol: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.9,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 16,
    marginTop: 0,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  buyButton: {
    backgroundColor: "#4CAF50",
  },
  sellButton: {
    backgroundColor: "#FF4444",
  },
});

export default StockDetails;
