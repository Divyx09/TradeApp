import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, DataTable } from 'react-native-paper';

const Portfolio = () => {
  // Mock data - replace with real API data
  const holdings = [
    { id: '1', symbol: 'RELIANCE', quantity: 10, avgPrice: 2400, currentPrice: 2450.75, pnl: '+507.50' },
    { id: '2', symbol: 'TCS', quantity: 5, avgPrice: 3500, currentPrice: 3550.25, pnl: '+250.25' },
    { id: '3', symbol: 'HDFC', quantity: 15, avgPrice: 1650, currentPrice: 1680.90, pnl: '+463.50' },
  ];

  const totalValue = holdings.reduce((sum, stock) => sum + (stock.currentPrice * stock.quantity), 0);
  const totalInvestment = holdings.reduce((sum, stock) => sum + (stock.avgPrice * stock.quantity), 0);
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

            {holdings.map((holding) => (
              <DataTable.Row key={holding.id}>
                <DataTable.Cell>{holding.symbol}</DataTable.Cell>
                <DataTable.Cell numeric>{holding.quantity}</DataTable.Cell>
                <DataTable.Cell numeric>{holding.avgPrice}</DataTable.Cell>
                <DataTable.Cell numeric>{holding.currentPrice}</DataTable.Cell>
                <DataTable.Cell 
                  numeric
                  textStyle={{ color: holding.pnl.startsWith('+') ? 'green' : 'red' }}
                >
                  {holding.pnl}
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
