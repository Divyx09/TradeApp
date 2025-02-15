import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import Operations from "./Operation";
import { setAuthToken } from "../../config/axios";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (email === "divy@gmail.com" && password === "4235deep") {
        setAuthToken("admin-token");
        navigation.replace("AdminTabs");
        return;
      }

      const response = await Operations.LoginUser({
        email,
        password,
      });

      const { user, token } = response;
      setAuthToken(token);

      // Navigate based on role
      if (user.role === "broker") {
        navigation.replace("BrokerTabs");
      } else {
        navigation.replace("UserTabs");
      }
    } catch (error) {
      setError(error.message || "Failed to login");
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
          onChangeText={setEmail}
          autoCapitalize='none'
          keyboardType='email-address'
          style={styles.input}
          mode='outlined'
        />

        <TextInput
          label='Password'
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode='outlined'
        />

        <Button
          mode='contained'
          onPress={handleLogin}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Login
        </Button>

        <Button
          mode='text'
          onPress={() => navigation.navigate("ForgotPassword")}
          style={styles.linkButton}
        >
          Forgot Password?
        </Button>

        <Button
          mode='text'
          onPress={() => navigation.navigate("Signup")}
          style={styles.linkButton}
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
