import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";

import { Platform } from "react-native";

// Using actual IP address
// const baseURL = 'http://192.168.29.33:5000/api';
// const baseURL = 'http://192.168.29.33:5000/api';

// Create axios instance with custom config
const instance = axios.create({
  baseURL: API_URL,
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
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      await AsyncStorage.removeItem("token");
      delete instance.defaults.headers.common["Authorization"];
    }
  } catch (error) {
    console.error("Error setting auth token:", error);
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
