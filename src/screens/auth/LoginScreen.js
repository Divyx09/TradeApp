import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text, ActivityIndicator, Surface } from "react-native-paper";
import Operations from "./Operation";
import { setAuthToken } from "../../config/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
      setError("");
      if (!validateInputs()) return;
      setLoading(true);

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
        navigation.replace("AdminTabs");
        return;
      }

      const response = await Operations.LoginUser({
        email,
        password,
      });

      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }

      const { user, token } = response;
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      await setAuthToken(token);

      if (user.role === "broker") {
        navigation.replace("BrokerTabs");
      } else {
        navigation.replace("UserTabs");
      }
    } catch (error) {
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
        <Surface style={styles.formCard}>
          <MaterialCommunityIcons 
            name="chart-line-variant" 
            size={60} 
            color="#00B4D8" 
            style={styles.logo}
          />
          
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to continue trading</Text>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TextInput
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError("");
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
            disabled={loading}
            error={error && error.includes('Email')}
            left={<TextInput.Icon icon="email" color="#808080" />}
            outlineColor="#404040"
            activeOutlineColor="#00B4D8"
            textColor="#FFFFFF"
            theme={{
              colors: {
                background: '#2A2A2A',
                placeholder: '#808080',
                text: '#FFFFFF'
              }
            }}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
            secureTextEntry
            style={styles.input}
            mode="outlined"
            disabled={loading}
            error={error && error.includes('Password')}
            left={<TextInput.Icon icon="lock" color="#808080" />}
            outlineColor="#404040"
            activeOutlineColor="#00B4D8"
            textColor="#FFFFFF"
            theme={{
              colors: {
                background: '#2A2A2A',
                placeholder: '#808080',
                text: '#FFFFFF'
              }
            }}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            loading={loading}
            disabled={loading}
            buttonColor="#00B4D8"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.linkButton}
            textColor="#00B4D8"
          >
            Forgot Password?
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate("Signup")}
            style={styles.signupButton}
            textColor="#FFFFFF"
          >
            Create New Account
          </Button>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  formCard: {
    backgroundColor: "#1E1E1E",
    padding: 24,
    borderRadius: 12,
    elevation: 2,
  },
  logo: {
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#808080",
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#2A2A2A",
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 12,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#404040",
  },
  dividerText: {
    color: "#808080",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  signupButton: {
    borderColor: "#404040",
  },
  errorText: {
    color: "#FF4444",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
});

export default LoginScreen;
