import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';
import authService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      const { user: userData, token } = response;
      
      authService.setAuthToken(token);
      setUser(userData);
    } catch (error) {
      throw new Error(error.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.logout();
      authService.setAuthToken(null);
      setUser(null);
      Alert.alert('Success', 'You have been signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const signUp = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      const { user: newUser, token } = response;
      
      authService.setAuthToken(token);
      setUser(newUser);
    } catch (error) {
      throw new Error(error.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>
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
