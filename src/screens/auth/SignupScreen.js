import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { TextInput, Button, Text, HelperText, Surface } from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Operations from "./Operation";
import { setAuthToken } from "../../config/axios";

const { width } = Dimensions.get('window');

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
  const [secureTextEntry, setSecureTextEntry] = useState({
    password: true,
    confirmPassword: true,
  });

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

  const toggleSecureEntry = (field) => {
    setSecureTextEntry({
      ...secureTextEntry,
      [field]: !secureTextEntry[field],
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.formContainer} elevation={2}>
          <View style={styles.headerContainer}>
            <MaterialCommunityIcons name="account-plus" size={48} color="#00B4D8" />
            <Text style={styles.title} variant="headlineMedium">
              Create Account
            </Text>
            <Text style={styles.subtitle}>
              Join us to start trading stocks and more
            </Text>
          </View>

          {errors.submit && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#FF4444" />
              <Text style={styles.errorText}>{errors.submit}</Text>
            </View>
          )}

          <TextInput
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={styles.input}
            mode="outlined"
            error={!!errors.name}
            left={<TextInput.Icon icon="account" color="#666" />}
            theme={{ colors: { primary: '#00B4D8' } }}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
            error={!!errors.email}
            left={<TextInput.Icon icon="email" color="#666" />}
            theme={{ colors: { primary: '#00B4D8' } }}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>

          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry={secureTextEntry.password}
            style={styles.input}
            mode="outlined"
            error={!!errors.password}
            left={<TextInput.Icon icon="lock" color="#666" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry.password ? "eye" : "eye-off"}
                onPress={() => toggleSecureEntry('password')}
                color="#666"
              />
            }
            theme={{ colors: { primary: '#00B4D8' } }}
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password}
          </HelperText>

          <TextInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, confirmPassword: text })
            }
            secureTextEntry={secureTextEntry.confirmPassword}
            style={styles.input}
            mode="outlined"
            error={!!errors.confirmPassword}
            left={<TextInput.Icon icon="lock-check" color="#666" />}
            right={
              <TextInput.Icon
                icon={secureTextEntry.confirmPassword ? "eye" : "eye-off"}
                onPress={() => toggleSecureEntry('confirmPassword')}
                color="#666"
              />
            }
            theme={{ colors: { primary: '#00B4D8' } }}
          />
          <HelperText type="error" visible={!!errors.confirmPassword}>
            {errors.confirmPassword}
          </HelperText>

          <TextInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="phone" color="#666" />}
            theme={{ colors: { primary: '#00B4D8' } }}
          />

          <Button
            mode="contained"
            onPress={handleSignup}
            style={styles.button}
            loading={loading}
            disabled={loading}
            buttonColor="#00B4D8"
          >
            Create Account
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Login")}
            style={styles.linkButton}
            textColor="#00B4D8"
          >
            Already have an account? Login
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#1E1E1E",
    padding: 24,
    borderRadius: 16,
    width: Math.min(400, width - 40),
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  subtitle: {
    color: "#B0B0B0",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  input: {
    marginBottom: 4,
    backgroundColor: "#2A2A2A",
  },
  button: {
    marginTop: 24,
    paddingVertical: 6,
    borderRadius: 8,
  },
  linkButton: {
    marginTop: 16,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF444420",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF4444",
    marginLeft: 8,
    flex: 1,
  },
});

export default SignupScreen;