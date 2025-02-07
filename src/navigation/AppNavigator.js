import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';

// User Screens
import UserDashboard from '../screens/user/UserDashboard';
import StockList from '../screens/user/StockList';
import Portfolio from '../screens/user/Portfolio';
import UserProfile from '../screens/user/UserProfile';

// Broker Screens
import BrokerDashboard from '../screens/broker/BrokerDashboard';
import ClientList from '../screens/broker/ClientList';
import BrokerProfile from '../screens/broker/BrokerProfile';

// Admin Screens
import AdminDashboard from '../screens/admin/AdminDashboard';
import UserManagement from '../screens/admin/UserManagement';
import BrokerManagement from '../screens/admin/BrokerManagement';
import AdminProfile from '../screens/admin/AdminProfile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const UserTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Stocks':
            iconName = focused ? 'trending-up' : 'trending-up-outline';
            break;
          case 'Portfolio':
            iconName = focused ? 'pie-chart' : 'pie-chart-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={UserDashboard} />
    <Tab.Screen name="Stocks" component={StockList} />
    <Tab.Screen name="Portfolio" component={Portfolio} />
    <Tab.Screen name="Profile" component={UserProfile} />
  </Tab.Navigator>
);

const BrokerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Clients':
            iconName = focused ? 'people' : 'people-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={BrokerDashboard} />
    <Tab.Screen name="Clients" component={ClientList} />
    <Tab.Screen name="Profile" component={BrokerProfile} />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Dashboard':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'Users':
            iconName = focused ? 'people' : 'people-outline';
            break;
          case 'Brokers':
            iconName = focused ? 'briefcase' : 'briefcase-outline';
            break;
          case 'Profile':
            iconName = focused ? 'person' : 'person-outline';
            break;
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={AdminDashboard} />
    <Tab.Screen name="Users" component={UserManagement} />
    <Tab.Screen name="Brokers" component={BrokerManagement} />
    <Tab.Screen name="Profile" component={AdminProfile} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          // Auth Stack
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // Role-based Stack
          <>
            {user.role === 'user' && (
              <Stack.Screen 
                name="UserTabs" 
                component={UserTabs}
                options={{ headerShown: false }}
              />
            )}
            {user.role === 'broker' && (
              <Stack.Screen 
                name="BrokerTabs" 
                component={BrokerTabs}
                options={{ headerShown: false }}
              />
            )}
            {user.role === 'admin' && (
              <Stack.Screen 
                name="AdminTabs" 
                component={AdminTabs}
                options={{ headerShown: false }}
              />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
