import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens
import Portfolio from "../screens/user/Portfolio";
import ProfileScreen from "../screens/user/ProfileScreen";
import StockList from "../screens/user/StockList";
import UserDashboard from "../screens/user/UserDashboard";
import BuyScreen from "../screens/user/BuyScreen";
import SellScreen from "../screens/user/SellScreen";
import StockDetails from "../screens/user/StockDetails";
import TransactionsScreen from "../screens/user/TransactionsScreen";
import ForexScreen from "../screens/user/ForexScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const UserTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#00B4D8",
        tabBarInactiveTintColor: "#808080",
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#1E1E1E',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontSize: 20,
          fontWeight: '600',
        },
        headerTintColor: '#FFFFFF',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={UserDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard"
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Portfolio"
        component={Portfolio}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-line"
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Stocks"
        component={StockList}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="trending-up"
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Forex"
        component={ForexScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="currency-usd"
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle"
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Stack Navigator to Include Buy and Sell Pages
const UserStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#1E1E1E',
        elevation: 0,
        shadowOpacity: 0,
      },
      headerTitleStyle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
      },
      headerTintColor: '#FFFFFF',
      headerBackTitleVisible: false,
      headerShadowVisible: false,
      contentStyle: {
        backgroundColor: '#121212',
      },
    }}
  >
    <Stack.Screen
      name="Tabs"
      component={UserTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Buy"
      component={BuyScreen}
      options={{ 
        title: "Buy Stocks",
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="Sell"
      component={SellScreen}
      options={{ 
        title: "Sell Stocks",
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="StockDetails"
      component={StockDetails}
      options={{ 
        title: "Stock Details",
        animation: 'slide_from_right',
      }}
    />
    <Stack.Screen
      name="Transactions"
      component={TransactionsScreen}
      options={{ 
        title: "Transaction History",
        animation: 'slide_from_right',
      }}
    />
  </Stack.Navigator>
);

export default UserStackNavigator;
