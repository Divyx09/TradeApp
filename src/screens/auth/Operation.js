import { Platform } from "react-native";
import { BASE_URL } from "../../config/urls";

// const BASE_URL = "http://192.168.29.33:5000/api/auth";

const Operations = {
  SignUpUser: async (userData) => {
    try {
      console.log("Attempting to register with URL:", BASE_URL);
      const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("Registration response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  LoginUser: async (credentials) => {
    try {
      console.log("Attempting to login with URL:", BASE_URL);
      console.log("Login request details:", {
        url: `${BASE_URL}/login`,
        method: "POST",
        email: credentials.email,
        passwordLength: credentials.password?.length,
      });

      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Server response was not in JSON format");
      }

      console.log("Login response details:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: data,
      });

      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }

      if (!data.token || !data.user) {
        throw new Error("Invalid response format from server");
      }

      return data;
    } catch (error) {
      console.error("Login error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });

      // Enhance error message based on the type of error
      if (error.message.includes("Network request failed")) {
        throw new Error(
          "Unable to connect to the server. Please check your internet connection.",
        );
      } else if (error.message.includes("JSON")) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw error;
      }
    }
  },
};

export default Operations;
