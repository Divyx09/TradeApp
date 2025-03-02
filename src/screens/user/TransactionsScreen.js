import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Surface, ActivityIndicator, IconButton, Chip, Button } from 'react-native-paper';
import { getAuthToken } from '../../config/axios';
import { API_URL } from '../../config/urls';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Fetching transactions with token:', token); // Debug log

      const response = await fetch(`${API_URL}/portfolio/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      const data = await response.json();
      console.log('Transactions response:', data); // Debug log

      // The backend returns the transactions array directly, not wrapped in a transactions property
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message);
      setTransactions([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = React.useMemo(() => {
    return (transactions || []).filter(transaction => {
      if (filter === 'ALL') return true;
      return transaction.type === filter;
    });
  }, [transactions, filter]);

  const renderTransaction = ({ item }) => {
    // Ensure numeric values with defaults
    const quantity = Number(item?.quantity || 0);
    const price = Number(item?.price || 0);
    const total = Number(item?.total || 0);
    
    return (
      <Surface style={[styles.transactionCard, { backgroundColor: "#2A2A2A" }]}>
        <View style={styles.transactionHeader}>
          <View>
            <Text style={styles.symbolText}>{item?.symbol || 'Unknown'}</Text>
            <Text style={styles.dateText}>
              {item?.timestamp ? new Date(item.timestamp).toLocaleString() : 'No date'}
            </Text>
          </View>
          <Chip 
            mode="flat" 
            style={[
              styles.typeChip,
              { backgroundColor: item?.type === 'BUY' ? '#4CAF5033' : '#FF444433' }
            ]}
          >
            <Text style={[
              styles.typeText,
              { color: item?.type === 'BUY' ? '#4CAF50' : '#FF4444' }
            ]}>
              {item?.type || 'Unknown'}
            </Text>
          </Chip>
        </View>
        
        <View style={styles.transactionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity</Text>
            <Text style={styles.detailValue}>{quantity} shares</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>₹{price.toFixed(2)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={styles.detailValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>
      </Surface>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'ALL'}
          onPress={() => setFilter('ALL')}
          style={styles.filterChip}
        >
          All
        </Chip>
        <Chip
          selected={filter === 'BUY'}
          onPress={() => setFilter('BUY')}
          style={styles.filterChip}
        >
          Buy
        </Chip>
        <Chip
          selected={filter === 'SELL'}
          onPress={() => setFilter('SELL')}
          style={styles.filterChip}
        >
          Sell
        </Chip>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchTransactions}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00B4D8"
              colors={["#00B4D8"]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No transactions found</Text>
          }
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
  },
  transactionCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  symbolText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#B0B0B0',
    fontSize: 12,
    marginTop: 4,
  },
  typeChip: {
    borderRadius: 16,
  },
  typeText: {
    fontWeight: 'bold',
  },
  transactionDetails: {
    backgroundColor: '#1E1E1E',
    padding: 12,
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#B0B0B0',
  },
  detailValue: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
  },
  errorText: {
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: '#B0B0B0',
    textAlign: 'center',
    marginTop: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#00B4D8',
  },
});

export default TransactionsScreen; 