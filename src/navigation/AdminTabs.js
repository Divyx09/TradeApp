import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import admin screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import UserManagement from '../screens/admin/UserManagement';
import BrokerManagement from '../screens/admin/BrokerManagement';
import AdminProfile from '../screens/admin/AdminProfile';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
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
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Users"
        component={UserManagement}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Brokers"
        component={BrokerManagement}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="briefcase-account" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={AdminProfile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs; 