import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, DataTable } from 'react-native-paper';
import { getAuthToken } from '../../config/axios';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const Portfolio = () => {

  //storing portfolio data
  const [data, setData] = useState({ holdings: [] });

  //fetching data from DB
  const fetchPortfolio = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch(`http://192.168.56.1:5000/api/portfolio/holdings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const result = await response.json();
      console.log(result);
      setData(result);
    } catch (error) {
      console.log("Network Error:", error.message);
    }
  };

  //storing pnl of every stock
  const [stockPnl,setstockPnl] =useState({});

  const calStockPnl =() =>{
    const pnl ={}
    for (const holding of data.holdings) {
      pnl[holding.symbol] = (holding.currentPrice * holding.quantity - holding.averageBuyPrice * holding.quantity ).toFixed(2)
    }
    setstockPnl(pnl)
  }
  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPortfolio();
    }, [])
  );

useEffect(()=>{
  if(data.holdings.length > 0)
  {
    calStockPnl();
  }
})


  const totalValue = data.holdings.reduce((sum, stock) => sum + (stock.currentPrice * stock.quantity), 0);
  const totalInvestment = data.holdings.reduce((sum, stock) => sum + (stock.averageBuyPrice * stock.quantity), 0);
  const totalPnL = totalValue - totalInvestment;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleLarge">Portfolio Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text variant="bodyMedium">Current Value</Text>
              <Text variant="titleMedium">₹{totalValue.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text variant="bodyMedium">Total P&L</Text>
              <Text
                variant="titleMedium"
                style={{ color: totalPnL >= 0 ? 'green' : 'red' }}
              >
                ₹{totalPnL.toFixed(2)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.holdingsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.holdingsTitle}>Your Holdings</Text>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Stock</DataTable.Title>
              <DataTable.Title numeric>Qty</DataTable.Title>
              <DataTable.Title numeric>Avg</DataTable.Title>
              <DataTable.Title numeric>LTP</DataTable.Title>
              <DataTable.Title numeric>P&L</DataTable.Title>
            </DataTable.Header>

            {data.holdings.map((holding) => (
              <DataTable.Row key={holding.id}>
                <DataTable.Cell>{holding.symbol}</DataTable.Cell>
                <DataTable.Cell numeric>{holding.quantity}</DataTable.Cell>
                <DataTable.Cell numeric>{holding.averageBuyPrice.toFixed(2)}</DataTable.Cell>
                <DataTable.Cell numeric>{holding.currentPrice}</DataTable.Cell>
                <DataTable.Cell
                  numeric
                >
                  <Text style={{color:stockPnl[holding.symbol] > 0 ?'green' :'red'}}>
                  {stockPnl[holding.symbol]}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    margin: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  holdingsCard: {
    margin: 16,
  },
  holdingsTitle: {
    marginBottom: 16,
  },
});

export default Portfolio;
