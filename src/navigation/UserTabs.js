import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Import screens (we'll create these next)
import Portfolio from "../screens/user/Portfolio";
import ProfileScreen from "../screens/user/ProfileScreen";
import StockList from "../screens/user/StockList";
import UserDashboard from "../screens/user/UserDashboard";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BuyScreen from "../screens/user/BuyScreen";
import SellScreen from "../screens/user/SellScreen";
import StockDetails from "../screens/user/StockDetails";
import RecentTrasection from "../screens/user/RecentTrasection";

const Stack = createNativeStackNavigator();
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
            <MaterialCommunityIcons
              name='view-dashboard'
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name='Portfolio'
        component={Portfolio }
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='chart-line'
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name='Stocks'
        component={StockList}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='trending-up'
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name='account-circle'
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Stack Navigator to Include Buy and Sell Pages
const UserStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name='Tabs'
      component={UserTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name='Buy'
      component={BuyScreen}
      options={{ headerTitle: "Buy Stocks", headerBackTitle: "Back" }}
    />
    <Stack.Screen
      name='Sell'
      component={SellScreen}
      options={{ headerTitle: "Sell Stocks", headerBackTitle: "Back" }}
    />
    <Stack.Screen
      name='StockDetails'
      component={StockDetails}
      options={{ headerTitle: "Stock Details", headerBackTitle: "Back" }}
    ></Stack.Screen>
    <Stack.Screen
      name='portfolio'
      component={Portfolio}
      options={{ headerTitle: "portfolio", headerBackTitle: "Back" }}
    ></Stack.Screen>
    <Stack.Screen
      name='recentTransection'
      component={RecentTrasection}
      options={{ headerTitle: "recentTransection", headerBackTitle: "Back" }}
    ></Stack.Screen>
  </Stack.Navigator>
);

export default UserStackNavigator;
