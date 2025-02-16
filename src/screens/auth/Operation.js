import { Platform } from 'react-native';

// Using actual IP address
// const BASE_URL = "http://192.168.29.33:5000/api/auth";
const BASE_URL = "http://192.168.1.5:5000/api/auth";

const Operations = {
  SignUpUser: async (userData) => {
    try {
      console.log('Attempting to register with URL:', BASE_URL);
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  LoginUser: async (credentials) => {
    try {
      console.log('Attempting to login with URL:', BASE_URL);
      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
};

export default Operations;
