import {
  View,
  Button,
  Border,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useState,useEffect } from "react";
import CandleChart from "./CandleChart";

const StockDetails = ({ navigation, route }) => {
  // Dummy Stock Data
  const { stock } = route.params;

  const [timeFrame,setTimeFrame] = useState('')

  const handleTimeRange = (e) => {
    setTimeFrame(e)
    console.log(timeFrame);
  }

  return (
    <ScrollView style={styles.container}>
      {/* Stock Name & Symbol */}
      <Text style={styles.title}>{stock.symbol}</Text>
      <Text style={styles.symbol}>
        {stock.symbol} | {stock.exchange}
      </Text>

      {/* Current Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>₹{stock.price}</Text>
        <Text
          style={[
            styles.change,
            stock.change > 0 ? styles.positive : styles.negative,
          ]}
        >
          {stock.change.toFixed(3)}
        </Text>
      </View>

      {/* Market Data */}
      <View style={styles.statsContainer}>
        <Text>📈 Change: ₹{stock.change}</Text>
        <Text>📊 Change Percent: {stock.changePercent}%</Text>
        <Text>📊 Volume: {stock.volume}</Text>
        <Text>💰 Market Cap: ₹{stock.marketCap}</Text>
        <Text>⏳ Timestamp: {stock.timestamp}</Text>
      </View>

      {/* Button for fetching data according to time-lapse */}
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.button} onPress={()=>handleTimeRange("5y")}><Text>5yr</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={()=>handleTimeRange("1y")}><Text>1yr</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={()=>handleTimeRange("6mo")}><Text>6mo</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={()=>handleTimeRange("1mo")}><Text>1mo</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={()=>handleTimeRange("5d")}><Text>5d</Text></TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={()=>handleTimeRange("1d")}><Text>1d</Text></TouchableOpacity>
        
      </View>
      {/* Dummy Stock Chart (Replace with real graph later) */}
      <View style={styles.chartPlaceholder}>
        {/* <Text style={{ color: "#888" }}>📉 Stock Chart Coming Soon...</Text> */}
        <CandleChart symbol={stock.symbol} timeFrame={timeFrame} />
      </View>

      {/* Buy & Sell Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buyButton}
          onPress={() => navigation.navigate("Buy", { stock })}
        >
          <MaterialCommunityIcons name="cart" size={20} color="white" />
          <Text style={styles.buttonText}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => navigation.navigate("Sell", { stock })}
        >
          <MaterialCommunityIcons name="cash" size={20} color="white" />
          <Text style={styles.buttonText}>Sell</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default StockDetails;

const styles = StyleSheet.create({
  btnContainer:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'center',
    alignContent:'center',
    gap:5,
    marginVertical:3
  },
  button:{
    color:'white',
    padding:10,
    // width:60,
    backgroundColor:'cyan',
    borderRadius:5,
    borderWidth:1,
    borderColor:'black'
  },
  container: { padding: 20, backgroundColor: "#fff", flex: 1 },
  title: { fontSize: 22, fontWeight: "bold" },
  symbol: { fontSize: 16, color: "#666" },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  price: { fontSize: 28, fontWeight: "bold" },
  change: { fontSize: 16, marginLeft: 10 },
  positive: { color: "green" },
  negative: { color: "red" },
  statsContainer: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    paddingVertical: 20,
    borderRadius: 8,
    marginVertical: 10,
    gap: 10,
    fontWeight:500
  },
  chartPlaceholder: {
    height: 300,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  newsItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  newsTitle: { fontSize: 16, fontWeight: "bold" },
  newsSource: { fontSize: 14, color: "#666" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
  },
  sellButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: { color: "white", fontWeight: "bold", marginLeft: 5 },
});
