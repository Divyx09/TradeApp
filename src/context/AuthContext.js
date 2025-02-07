import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const USER_STORAGE_KEY = '@user_data';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    setLoading(true);
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      // TODO: Replace with your actual API call
      // This is a mock implementation
      let mockUser;
      
      if (email === 'user@example.com' && password === '123') {
        mockUser = { id: 1, email, role: 'user' };
      } else if (email === 'broker@example.com' && password === '123') {
        mockUser = { id: 2, email, role: 'broker' };
      } else if (email === 'admin@example.com' && password === '123') {
        mockUser = { id: 3, email, role: 'admin' };
      } else {
        throw new Error('Invalid credentials');
      }

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      throw new Error(error.message || 'Error signing in');
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.clear();
      setUser(null);
      Alert.alert('Success', 'You have been signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
