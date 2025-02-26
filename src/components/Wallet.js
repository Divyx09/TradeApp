import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, List } from 'react-native-paper';
import { useWallet } from '../context/WalletContext';

const Wallet = () => {
  const { balance, transactions } = useWallet();

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Text variant="titleLarge">Your Wallet</Text>
        <Text variant="headlineMedium" style={styles.balance}>
          ₹{balance.toLocaleString('en-IN', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          })}
        </Text>
        
        <Text variant="titleMedium" style={styles.transactionTitle}>
          Recent Transactions
        </Text>
        
        {transactions.slice(0, 5).map((transaction, index) => (
          <List.Item
            key={index}
            title={`${transaction.type} ${transaction.stockSymbol}`}
            description={`${transaction.quantity} shares @ ₹${transaction.price}`}
            right={() => (
              <Text style={{
                color: transaction.type === 'BUY' ? '#FF4444' : '#4CAF50',
                fontWeight: 'bold'
              }}>
                {transaction.type === 'BUY' ? '-' : '+'}₹{Math.abs(transaction.amount).toFixed(2)}
              </Text>
            )}
          />
        ))}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    elevation: 2,
  },
  balance: {
    color: '#2196F3',
    fontWeight: 'bold',
    marginVertical: 8,
  },
  transactionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
});

export default Wallet; 