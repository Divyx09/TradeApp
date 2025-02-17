import { React } from "react";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, StyleSheet, FlatList } from "react-native";
import { Text, Card, Button, Searchbar } from "react-native-paper";

const StockList = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [stocks, setStocks] = useState();

  // Construct the API URL
  const yahooFinanceAPI = `http://192.168.29.33:5000/api/stocks/quotes?symbols=ADANIENT.NS,ADANIPORTS.NS,APOLLOHOSP.NS,ASIANPAINT.NS,AXISBANK.NS,BAJAJ-AUTO.NS,BAJAJFINSV.NS,BAJFINANCE.NS,BEL.NS,BHARTIARTL.NS,BPCL.NS,BRITANNIA.NS,CIPLA.NS,COALINDIA.NS,DIVISLAB.NS,DRREDDY.NS,EICHERMOT.NS,GRASIM.NS,HCLTECH.NS,HDFCBANK.NS,HDFCLIFE.NS,HEROMOTOCO.NS,HINDALCO.NS,HINDUNILVR.NS,ICICIBANK.NS,INDUSINDBK.NS,INFY.NS,IOC.NS,ITC.NS,JSWSTEEL.NS,KOTAKBANK.NS,LT.NS,M&M.NS,MARUTI.NS,NESTLEIND.NS,NTPC.NS,ONGC.NS,POWERGRID.NS,RELIANCE.NS,SBILIFE.NS,SBIN.NS,SUNPHARMA.NS,TATACONSUM.NS,TATAMOTORS.NS,TATASTEEL.NS,TCS.NS,TECHM.NS,TITAN.NS,ULTRACEMCO.NS,WIPRO.NS
`;

  useEffect(() => {
    async function fetchStockData() {
      try {
        const response = await fetch(yahooFinanceAPI);
        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const data = await response.json();
        setStocks(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    }

    fetchStockData();
  }, []);

  const renderStockItem = ({ item }) =>
    item.symbol.toLowerCase().startsWith(searchQuery.toLowerCase()) ? (
      <Card
        style={styles.stockCard}
        onPress={() => navigation.navigate("StockDetails", { stock: item })}
      >
        <Card.Content>
          <View style={styles.stockHeader}>
            <View>
              <Text variant='titleMedium'>{item.symbol}</Text>
              <Text variant='bodyMedium'>{item.symbol}</Text>
            </View>
            <View>
              <Text variant='titleMedium'>₹ {item.price}</Text>
              <Text
                style={{
                  color: item.change < 0 ? "red" : "green",
                }}
              >
                {item.changePercent}
              </Text>
            </View>
          </View>
        </Card.Content>
        <Card.Actions>
          <Button
            name='BuyScreen'
            mode='contained'
            onPress={() => {
              navigation.navigate("Buy", { symbol: item });
            }}
          >
            Buy
          </Button>
          <Button
            name='SellScreen'
            mode='contained'
            onPress={() => {
              navigation.navigate("Sell", { stock: item });
            }}
          >
            Sell
          </Button>
        </Card.Actions>
      </Card>
    ) : null;

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder='Search stocks'
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={stocks}
        renderItem={renderStockItem}
        keyExtractor={(item, index) => item.timestamp + index}
        contentContainerStyle={styles.listContainer}
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
  },
  listContainer: {
    padding: 16,
  },
  stockCard: {
    marginBottom: 16,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
});

export default StockList;
