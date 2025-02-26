import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/urls';
import { getAuthToken } from '../config/axios';
import axios from '../config/axios';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch balance from API
  const fetchBalance = async () => {
    try {
      setError(null);
      const response = await axios.get('/wallet/balance');
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setError(error.response?.data?.message || 'Failed to fetch wallet balance');
    } finally {
      setIsLoading(false);
    }
  };

  // Load balance when component mounts or auth token changes
  useEffect(() => {
    fetchBalance();
  }, []);

  // Add money to wallet
  const addMoney = async (amount) => {
    try {
      setError(null);
      const response = await axios.post('/wallet/add', { amount });
      setBalance(response.data.balance);
      return response.data.balance;
    } catch (error) {
      console.error('Error adding money to wallet:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add money to wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Remove money from wallet
  const removeMoney = async (amount) => {
    try {
      setError(null);
      const response = await axios.post('/wallet/remove', { amount });
      setBalance(response.data.balance);
      return response.data.balance;
    } catch (error) {
      console.error('Error removing money from wallet:', error);
      const errorMessage = error.response?.data?.message || 'Failed to remove money from wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update wallet balance
  const updateBalance = async (newBalance) => {
    try {
      setError(null);
      const response = await axios.post('/wallet/update', { balance: newBalance });
      setBalance(response.data.balance);
      return response.data.balance;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update wallet balance';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Refresh balance (useful after transactions)
  const refreshBalance = () => {
    return fetchBalance();
  };

  return (
    <WalletContext.Provider value={{ 
      balance, 
      addMoney, 
      removeMoney, 
      updateBalance,
      refreshBalance,
      isLoading,
      error 
    }}>
      {children}
    </WalletContext.Provider>
  );
}; 