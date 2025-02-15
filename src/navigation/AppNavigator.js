import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Import role-based navigators
import UserTabs from './UserTabs';
import BrokerTabs from './BrokerTabs';
import AdminTabs from './AdminTabs';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Role-based Navigation */}
        <Stack.Screen name="UserTabs" component={UserTabs} />
        <Stack.Screen name="BrokerTabs" component={BrokerTabs} />
        <Stack.Screen name="AdminTabs" component={AdminTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
