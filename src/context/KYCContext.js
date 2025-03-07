import React, { createContext, useContext, useState } from 'react';
import { API_URL } from '../config/urls';
import axios from '../config/axios';

const KYCContext = createContext();

export const useKYC = () => {
  const context = useContext(KYCContext);
  if (!context) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
};

export const KYCProvider = ({ children }) => {
  const [kycStatus, setKYCStatus] = useState('pending'); // pending, submitted, verified, rejected
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Submit KYC documents
  const submitKYC = async (kycData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post('/kyc/submit', kycData);
      setKYCStatus('submitted');
      return response.data;
    } catch (error) {
      console.error('Error submitting KYC:', error);
      setError(error.response?.data?.message || 'Failed to submit KYC');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check KYC status
  const checkKYCStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('/kyc/status');
      setKYCStatus(response.data.status);
      return response.data.status;
    } catch (error) {
      console.error('Error checking KYC status:', error);
      setError(error.response?.data?.message || 'Failed to check KYC status');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KYCContext.Provider
      value={{
        kycStatus,
        isLoading,
        error,
        submitKYC,
        checkKYCStatus,
      }}
    >
      {children}
    </KYCContext.Provider>
  );
};