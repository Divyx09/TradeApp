import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Button, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../../config/urls';
import axios from '../../config/axios';
import { useWallet } from '../../context/WalletContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ForexTrade = ({ navigation, route }) => {
  const { forex, type, amount } = route.params;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { balance, refreshBalance } = useWallet();

  const handleTrade = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${API_URL}/forex/trade`, {
        pair: forex.symbol,
        type,
        amount,
        price: forex.price
      });

      if (response.data.success) {
        // Save transaction to local storage
        const newTransaction = {
          symbol: forex.symbol,
          quantity: 1, // For forex/crypto we use amount instead of quantity
          amount: amount,
          timestamp: new Date().toISOString(),
          total: amount * forex.price,
          type: type,
          price: forex.price,
          category: 'FOREX', // Add category to distinguish from stocks
          name: forex.name // Add name for better display
        };

        const storedTransactions = await AsyncStorage.getItem("transections");
        let transactions = storedTransactions ? JSON.parse(storedTransactions) : [];
        
        if (!Array.isArray(transactions)) transactions = [];
        if (transactions.length >= 5) transactions.pop();
        
        transactions.unshift(newTransaction);
        await AsyncStorage.setItem("transections", JSON.stringify(transactions));

        // Save to portfolio
        const storedPortfolio = await AsyncStorage.getItem("portfolio");
        let portfolio = storedPortfolio ? JSON.parse(storedPortfolio) : [];
        
        if (!Array.isArray(portfolio)) portfolio = [];
        
        // Find existing position
        const existingPosition = portfolio.find(p => 
          p.symbol === forex.symbol && p.category === 'FOREX'
        );

        if (existingPosition) {
          // Update existing position
          if (type === 'BUY') {
            existingPosition.amount += amount;
            existingPosition.total += amount * forex.price;
          } else {
            existingPosition.amount -= amount;
            existingPosition.total -= amount * forex.price;
          }
          // Remove position if amount becomes 0
          if (existingPosition.amount <= 0) {
            portfolio = portfolio.filter(p => p.symbol !== forex.symbol);
          }
        } else if (type === 'BUY') {
          // Add new position only for BUY
          portfolio.unshift({
            symbol: forex.symbol,
            name: forex.name,
            amount: amount,
            price: forex.price,
            total: amount * forex.price,
            category: 'FOREX',
            timestamp: new Date().toISOString()
          });
        }

        await AsyncStorage.setItem("portfolio", JSON.stringify(portfolio));
        
        refreshBalance();
        setShowConfirmation(true);
      }
    } catch (error) {
      console.error('Trade error:', error);
      setError(error.response?.data?.message || 'Failed to execute trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.card} elevation={2}>
        <Text style={styles.title}>Confirm {type}</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Forex Pair</Text>
          <Text style={styles.value}>{forex.symbol}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Type</Text>
          <Text style={[styles.value, { color: type === 'BUY' ? '#4CAF50' : '#FF4444' }]}>
            {type}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>₹{amount.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Price</Text>
          <Text style={styles.value}>{forex.price.toFixed(4)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Value</Text>
          <Text style={styles.value}>₹{(amount * forex.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
        </View>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.button}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleTrade}
            style={[styles.button, { backgroundColor: type === 'BUY' ? '#4CAF50' : '#FF4444' }]}
            disabled={loading}
            loading={loading}
          >
            Confirm {type}
          </Button>
        </View>
      </Surface>

      <Portal>
        <Modal
          visible={showConfirmation}
          onDismiss={() => {
            setShowConfirmation(false);
            navigation.navigate('Tabs', { screen: 'Forex' });
          }}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalContent}>
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color="#4CAF50"
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>Trade Successful!</Text>
            <Text style={styles.modalText}>
              Your {type.toLowerCase()} order for {forex.symbol} has been executed successfully.
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                setShowConfirmation(false);
                navigation.navigate('Tabs', { screen: 'Forex' });
              }}
              style={styles.modalButton}
            >
              Done
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  card: {
    backgroundColor: '#1E1E1E',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  label: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  error: {
    color: '#FF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  modal: {
    backgroundColor: '#1E1E1E',
    margin: 20,
    borderRadius: 12,
    padding: 20,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
  },
});

export default ForexTrade; 