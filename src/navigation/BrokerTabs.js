import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import broker screens
import BrokerDashboard from '../screens/broker/BrokerDashboard';
import ClientList from '../screens/broker/ClientList';
import BrokerProfile from '../screens/broker/BrokerProfile';

const Tab = createBottomTabNavigator();

const BrokerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={BrokerDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Clients"
        component={ClientList}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={BrokerProfile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BrokerTabs; 