import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import axios from "../../config/axios";
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
        <Surface style={styles.formCard}>
          <MaterialCommunityIcons 
            name="lock-reset" 
            size={60} 
            color="#00B4D8" 
            style={styles.logo}
          />

          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password.
          </Text>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {success ? (
            <Text style={styles.successText}>{success}</Text>
          ) : null}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            mode="outlined"
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

          <Button
            mode="contained"
            onPress={handleResetPassword}
            style={styles.resetButton}
            loading={loading}
            disabled={loading}
            buttonColor="#00B4D8"
          >
            {loading ? 'Sending...' : 'Reset Password'}
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Login')}
            style={styles.backButton}
            textColor="#FFFFFF"
          >
            Back to Login
          </Button>
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: '#1E1E1E',
    padding: 24,
    borderRadius: 12,
    elevation: 2,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#808080',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: '#2A2A2A',
  },
  resetButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#404040',
  },
  dividerText: {
    color: '#808080',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  backButton: {
    borderColor: '#404040',
  },
  errorText: {
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  successText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
});

export default ForgotPasswordScreen; 