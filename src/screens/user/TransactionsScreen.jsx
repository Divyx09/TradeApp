import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, ActivityIndicator, Surface, SegmentedButtons, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const storedTransactions = await AsyncStorage.getItem('transections');
      const transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
      setTransactions(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    if (activeTab === 'stocks') return !transaction.category || transaction.category === 'STOCKS';
    return transaction.category === activeTab.toUpperCase();
  });

  const renderTransaction = ({ item }) => {
    const isForexOrCrypto = item.category === 'FOREX' || item.category === 'CRYPTO';

    return (
      <Card style={styles.transactionCard}>
        <Card.Content>
          <View style={styles.transactionHeader}>
            <View style={styles.symbolContainer}>
              <Text style={styles.symbol}>{item.symbol}</Text>
              <Text style={styles.name}>{item.name || item.companyName}</Text>
            </View>
            <Chip
              style={[
                styles.typeChip,
                { backgroundColor: item.type === 'BUY' ? '#4CAF5020' : '#FF444420' }
              ]}
              textStyle={{ 
                color: item.type === 'BUY' ? '#4CAF50' : '#FF4444',
                fontSize: 12
              }}
            >
              {item.type}
            </Chip>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>
                {isForexOrCrypto ? 'Amount' : 'Quantity'}
              </Text>
              <Text style={styles.value}>
                {isForexOrCrypto ? 
                  `₹${item.amount.toLocaleString('en-IN')}` : 
                  item.quantity
                }
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Price</Text>
              <Text style={styles.value}>
                ₹{item.price.toFixed(isForexOrCrypto ? 4 : 2)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Total</Text>
              <Text style={styles.value}>
                ₹{item.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>
                {new Date(item.timestamp).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'stocks', label: 'Stocks' },
            { value: 'forex', label: 'Forex' },
            { value: 'crypto', label: 'Crypto' },
          ]}
          style={styles.segmentedButtons}
        />
      </Surface>

      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="history" size={48} color="#666" />
          <Text style={styles.emptyStateText}>No transactions found</Text>
          <Text style={styles.emptyStateSubtext}>
            Your {activeTab === 'all' ? 'trading' : activeTab} history will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item, index) => `${item.symbol}-${item.timestamp}-${index}`}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  segmentedButtons: {
    backgroundColor: '#2A2A2A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
  },
  listContainer: {
    padding: 16,
  },
  transactionCard: {
    backgroundColor: '#1E1E1E',
    marginBottom: 12,
    borderRadius: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  symbolContainer: {
    flex: 1,
    marginRight: 12,
  },
  symbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 2,
  },
  typeChip: {
    height: 24,
  },
  detailsContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    marginTop: 8,
    color: '#999',
  },
});

export default TransactionsScreen; 