import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import axios from "../../config/axios";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      setSuccess(response.data.message);
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process request');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title} variant="headlineMedium">
          Reset Password
        </Text>

        <Text style={styles.subtitle} variant="bodyMedium">
          Enter your email address and we'll send you instructions to reset your password.
        </Text>

        {error ? (
          <Text style={styles.error} variant="bodyMedium">
            {error}
          </Text>
        ) : null}

        {success ? (
          <Text style={styles.success} variant="bodyMedium">
            {success}
          </Text>
        ) : null}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          mode="outlined"
        />

        <Button
          mode="contained"
          onPress={handleResetPassword}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Reset Password
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          style={styles.linkButton}
        >
          Back to Login
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
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
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  success: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default ForgotPasswordScreen; 