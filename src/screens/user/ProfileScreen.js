import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  useWindowDimensions,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  Button,
  List,
  useTheme,
  ActivityIndicator,
  IconButton,
  Surface,
  Divider,
} from 'react-native-paper';
import { clearAuthToken } from '../../config/axios';
import { useWallet } from '../../context/WalletContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { balance, isLoading, error, refreshBalance } = useWallet();
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const data = await AsyncStorage.getItem('userData');
        if (data) {
          setUserData(JSON.parse(data));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await clearAuthToken();
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoadingUser) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Header */}
      <Surface style={styles.header} elevation={2}>
        <Avatar.Text
          size={80}
          label={userData?.name?.split(' ').map(n => n[0]).join('') || '??'}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name} variant="headlineSmall">
            {userData?.name || 'User'}
          </Text>
          <Text style={styles.email} variant="bodyLarge">
            {userData?.email || 'email@example.com'}
          </Text>
          <View style={styles.roleContainer}>
            <MaterialCommunityIcons 
              name={userData?.role === 'admin' ? 'shield-crown' : 'account'} 
              size={16} 
              color={theme.colors.primary}
            />
            <Text style={[styles.role, { color: theme.colors.primary }]}>
              {userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1) || 'User'}
            </Text>
          </View>
        </View>
      </Surface>

      {/* Wallet Card */}
      <Card style={styles.walletCard}>
        <Card.Content>
          <View style={styles.walletHeader}>
            <MaterialCommunityIcons name="wallet" size={24} color={theme.colors.primary} />
            <Text variant="titleLarge" style={styles.walletTitle}>Wallet Balance</Text>
            <IconButton
              icon="refresh"
              size={20}
              onPress={refreshBalance}
              disabled={isLoading}
            />
          </View>
          {isLoading ? (
            <ActivityIndicator style={styles.walletLoader} />
          ) : (
            <Text variant="displaySmall" style={styles.balance}>
              ₹{balance.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </Text>
          )}
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <Button
              mode="contained-tonal"
              icon="cash-plus"
              onPress={() => {/* Add Money Dialog */}}
              style={styles.actionButton}
            >
              Add Money
            </Button>
            <Button
              mode="contained-tonal"
              icon="history"
              onPress={() => {/* Show Transaction History */}}
              style={styles.actionButton}
            >
              History
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Settings</Text>
          <List.Item
            title="Security"
            left={props => <List.Icon {...props} icon="shield-lock" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          <Divider />
          <List.Item
            title="Help & Support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
        buttonColor={theme.colors.error}
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  avatar: {
    marginRight: 16,
  },
  name: {
    fontWeight: 'bold',
  },
  email: {
    opacity: 0.7,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  role: {
    marginLeft: 4,
    fontWeight: '500',
  },
  walletCard: {
    margin: 16,
    marginTop: 8,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletTitle: {
    flex: 1,
    marginLeft: 8,
  },
  walletLoader: {
    marginVertical: 16,
  },
  balance: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
  actionsCard: {
    margin: 16,
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  settingsCard: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '500',
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
  },
});

export default ProfileScreen; 