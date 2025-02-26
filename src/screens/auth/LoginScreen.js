import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text, HelperText, ActivityIndicator } from "react-native-paper";
import Operations from "./Operation";
import { setAuthToken } from "../../config/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    try {
      // Clear any previous errors
      setError("");

      // Validate inputs
      if (!validateInputs()) {
        return;
      }

      setLoading(true);

      // Special case for admin login
      if (email === "divy@gmail.com" && password === "4235deep") {
        const adminToken = "admin-token";
        const adminUser = {
          _id: 'admin',
          name: 'Admin User',
          email: email,
          role: 'admin'
        };
        
        await AsyncStorage.setItem('userData', JSON.stringify(adminUser));
        await setAuthToken(adminToken);
        console.log('Admin login successful');
        navigation.replace("AdminTabs");
        return;
      }

      console.log('Attempting to login with:', { email });
      const response = await Operations.LoginUser({
        email,
        password,
      });

      console.log('Login response:', response);

      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }

      const { user, token } = response;
      
      // Store user data and token
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      await setAuthToken(token);

      console.log('Login successful, navigating to appropriate screen');

      // Navigate based on role
      if (user.role === "broker") {
        navigation.replace("BrokerTabs");
      } else {
        navigation.replace("UserTabs");
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || "Failed to login. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant='headlineMedium'>
          Welcome Back
        </Text>

        {error ? (
          <Text style={styles.error} variant='bodyMedium'>
            {error}
          </Text>
        ) : null}

        <TextInput
          label='Email'
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError(""); // Clear error when user types
          }}
          autoCapitalize='none'
          keyboardType='email-address'
          style={styles.input}
          mode='outlined'
          disabled={loading}
          error={error && error.includes('Email')}
        />

        <TextInput
          label='Password'
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(""); // Clear error when user types
          }}
          secureTextEntry
          style={styles.input}
          mode='outlined'
          disabled={loading}
          error={error && error.includes('Password')}
        />

        <Button
          mode='contained'
          onPress={handleLogin}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Button
          mode='text'
          onPress={() => navigation.navigate("ForgotPassword")}
          style={styles.linkButton}
          disabled={loading}
        >
          Forgot Password?
        </Button>

        <Button
          mode='text'
          onPress={() => navigation.navigate("Signup")}
          style={styles.linkButton}
          disabled={loading}
        >
          Don't have an account? Sign Up
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  linkButton: {
    marginTop: 10,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 15,
  },
});

export default LoginScreen;
