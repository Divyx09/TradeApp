import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { TextInput, Button, Text, HelperText } from "react-native-paper";
import Operations from "./Operation";
import { setAuthToken } from "../../config/axios";

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...signupData } = formData;
      console.log("Sending signup data:", signupData);

      const response = await Operations.SignUpUser(signupData);
      console.log("Signup response:", response);

      const { user, token } = response;
      setAuthToken(token);

      if (user.role === "user") {
        navigation.replace("UserTabs");
      }
    } catch (error) {
      console.error("Signup error:", {
        message: error.message,
      });
      setErrors({
        submit: error.message || "Failed to register",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title} variant='headlineMedium'>
          Create Account
        </Text>

        {errors.submit && (
          <Text style={styles.error} variant='bodyMedium'>
            {errors.submit}
          </Text>
        )}

        <TextInput
          label='Full Name'
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          style={styles.input}
          mode='outlined'
          error={!!errors.name}
        />
        <HelperText type='error' visible={!!errors.name}>
          {errors.name}
        </HelperText>

        <TextInput
          label='Email'
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType='email-address'
          autoCapitalize='none'
          style={styles.input}
          mode='outlined'
          error={!!errors.email}
        />
        <HelperText type='error' visible={!!errors.email}>
          {errors.email}
        </HelperText>

        <TextInput
          label='Password'
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
          style={styles.input}
          mode='outlined'
          error={!!errors.password}
        />
        <HelperText type='error' visible={!!errors.password}>
          {errors.password}
        </HelperText>

        <TextInput
          label='Confirm Password'
          value={formData.confirmPassword}
          onChangeText={(text) =>
            setFormData({ ...formData, confirmPassword: text })
          }
          secureTextEntry
          style={styles.input}
          mode='outlined'
          error={!!errors.confirmPassword}
        />
        <HelperText type='error' visible={!!errors.confirmPassword}>
          {errors.confirmPassword}
        </HelperText>

        <TextInput
          label='Phone Number'
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType='phone-pad'
          style={styles.input}
          mode='outlined'
        />

        <Button
          mode='contained'
          onPress={handleSignup}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Sign Up
        </Button>

        <Button
          mode='text'
          onPress={() => navigation.navigate("Login")}
          style={styles.linkButton}
        >
          Already have an account? Login
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
  },
  input: {
    marginBottom: 5,
  },
  button: {
    marginTop: 20,
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

export default SignupScreen;
