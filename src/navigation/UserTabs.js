import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

// Import screens (we'll create these next)
import Portfolio from "../screens/user/Portfolio";
import ProfileScreen from "../screens/user/ProfileScreen";
import StockList from "../screens/user/StockList";
import UserDashboard from "../screens/user/UserDashboard";
const Tab = createBottomTabNavigator();

const UserTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#2196F3",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
      }}
    >
      <Tab.Screen
        name='Dashboard'
        component={UserDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='view-dashboard' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='Portfolio'
        component={Portfolio}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='chart-line' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='Stocks'
        component={StockList}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='trending-up' color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name='account-circle' color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default UserTabs;
