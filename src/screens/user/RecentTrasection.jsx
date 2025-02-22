import { StyleSheet, View } from "react-native";
import { Text, Card, Button, Searchbar } from "react-native-paper";
import React from "react";
import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList } from "react-native";
import { getAuthToken } from "../../config/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RecentTrasection = () => {
  //storing Transection  data
  const [transactions, setTransactions] = useState([]);

  const renderStockItem = ({ item }) => {
    return (
      <Card
        style={styles.stockCard}
        //   onPress={() => navigation.navigate("StockDetails", { stock: item })}
      >
        <Card.Content>
          <View style={styles.stockHeader}>
            <View style={styles.leftSection}>
              <Text variant="titleMedium" style={styles.heading}>
                {item.symbol}
              </Text>
              <Text variant="bodyMedium">quantity : {item.quantity}</Text>
            </View>
            <View style={styles.middleSection}>
              <Text
                style={{
                  color: item.type.startsWith("Bought") ? "green" : "red",
                  fontSize: 16,
                  textAlign: "center",
                }}
              >
                {item.type}
              </Text>
            </View>
            <View style={styles.rightSection}>
              <Text variant="titleSmall">
                {new Date(item.timestamp).toLocaleDateString("en-GB")}
              </Text>
              <Text variant="bodyMedium" style={{ marginVertical: 5 }}>
                {new Date(item.timestamp).toLocaleTimeString("en-US")}
              </Text>
              <Text style={styles.bold}>Total : ₹{item.total}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // //fetching data from DB
  // const fetchTransections = async () => {
  //   try {
  //     const token = await getAuthToken();
  //     const response = await fetch(
  //       `http://192.168.56.1:5000/api/portfolio/holdings`,
  //       {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     const result = await response.json();
  //     console.log(result);
  //     setTransection(result);
  //   } catch (error) {
  //     console.log("Network Error:", error.message);
  //   }
  // };

  const retriveData =async() =>{
    // Retrieve previous transactions
    const storedTransactions = await AsyncStorage.getItem("transections");
    let result = storedTransactions ? JSON.parse(storedTransactions) : [];

    // Ensure transactions is an array
    if (Array.isArray(result)) {
      setTransactions(result)
    }else{
      setTransactions([])
    }

  }

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
        retriveData()
      console.log(transactions);
    }, [])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        renderItem={renderStockItem}
        keyExtractor={(item, index) => item.timestamp + index}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default RecentTrasection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 3,
  },
  stockCard: {
    marginBottom: 16,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  whiteText: {
    color: "white",
  },
  bold: {
    fontWeight: "bold",
    fontSize: 16,
  },
  heading: {
    fontSize: 17,
    fontWeight: "bold",
  },

  middleSection: {
    width: 80, // Fixed width to align all types
    justifyContent: "center",
    alignItems: "left",
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
  }
});
