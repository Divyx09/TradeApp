import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "./urls";

import { Platform } from "react-native";

// Using actual IP address
// const baseURL = 'http://192.168.29.33:5000/api';
// const baseURL = 'http://192.168.29.33:5000/api';

// Create axios instance with custom config
const instance = axios.create({
  baseURL: API_URL, // Keep the /api in the base URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to add the JWT token to requests
instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('Making request to:', config.baseURL + config.url);
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle common response cases
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Clear token on authentication error
      await AsyncStorage.removeItem("token");
    }
    return Promise.reject(error);
  },
);

// Function to set the auth token
export const setAuthToken = async (token) => {
  try {
    if (token) {
      await AsyncStorage.setItem("token", token);
      // Set token in both instance defaults and AsyncStorage
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log('Token set successfully:', token);
    } else {
      await AsyncStorage.removeItem("token");
      delete instance.defaults.headers.common["Authorization"];
      console.log('Token cleared');
    }
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

// Function to initialize auth token from storage
export const initializeAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log('Token initialized from storage');
    }
  } catch (error) {
    console.error("Error initializing auth token:", error);
  }
};

// Function to get the current token
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Function to clear the auth token
export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem("token");
    delete instance.defaults.headers.common["Authorization"];
  } catch (error) {
    console.error("Error clearing auth token:", error);
  }
};

export default instance;
