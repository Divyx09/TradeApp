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
  Avatar,
  Button,
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
        <ActivityIndicator size="large" color="#00B4D8" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Surface style={styles.headerCard} elevation={2}>
        <View style={styles.headerContent}>
          <Avatar.Text
            size={80}
            label={userData?.name?.split(' ').map(n => n[0]).join('') || '??'}
            style={styles.avatar}
            color="#FFFFFF"
            theme={{ colors: { primary: '#00B4D8' }}}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{userData?.name || 'User'}</Text>
            <Text style={styles.email}>{userData?.email || 'email@example.com'}</Text>
            <View style={styles.roleContainer}>
              <MaterialCommunityIcons 
                name={userData?.role === 'admin' ? 'shield-crown' : 'account'} 
                size={16} 
                color="#00B4D8"
              />
              <Text style={styles.role}>
                {userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1) || 'User'}
              </Text>
            </View>
          </View>
        </View>
      </Surface>

      {/* Wallet Card */}
      <Surface style={styles.walletCard} elevation={2}>
        <View style={styles.walletHeader}>
          <View style={styles.walletTitleContainer}>
            <MaterialCommunityIcons name="wallet" size={24} color="#00B4D8" />
            <Text style={styles.walletTitle}>Wallet Balance</Text>
          </View>
          <IconButton
            icon="refresh"
            size={20}
            iconColor="#00B4D8"
            onPress={refreshBalance}
            disabled={isLoading}
          />
        </View>
        {isLoading ? (
          <ActivityIndicator style={styles.walletLoader} color="#00B4D8" />
        ) : (
          <Text style={styles.balance}>
            ₹{balance.toLocaleString('en-IN', {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            })}
          </Text>
        )}
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </Surface>

      {/* Quick Actions */}
      <Surface style={styles.actionsCard} elevation={2}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            icon="cash-plus"
            onPress={() => {/* Add Money Dialog */}}
            style={styles.actionButton}
            buttonColor="#2A2A2A"
            textColor="#FFFFFF"
          >
            Add Money
          </Button>
          <Button
            mode="contained"
            icon="history"
            onPress={() => navigation.navigate('Transactions')}
            style={styles.actionButton}
            buttonColor="#2A2A2A"
            textColor="#FFFFFF"
          >
            History
          </Button>
        </View>
      </Surface>

      {/* Settings */}
      <Surface style={styles.settingsCard} elevation={2}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.settingItem}>
          <MaterialCommunityIcons name="shield-lock" size={24} color="#00B4D8" />
          <Text style={styles.settingText}>Security</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#808080" />
        </View>
        <Divider style={styles.divider} />
        <View style={styles.settingItem}>
          <MaterialCommunityIcons name="bell" size={24} color="#00B4D8" />
          <Text style={styles.settingText}>Notifications</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#808080" />
        </View>
        <Divider style={styles.divider} />
        <View style={styles.settingItem}>
          <MaterialCommunityIcons name="help-circle" size={24} color="#00B4D8" />
          <Text style={styles.settingText}>Help & Support</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#808080" />
        </View>
      </Surface>

      {/* Logout Button */}
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
        buttonColor="#FF4444"
      >
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
  },
  headerCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
  },
  headerContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#00B4D8',
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  role: {
    marginLeft: 6,
    color: '#00B4D8',
    fontSize: 14,
    fontWeight: '500',
  },
  walletCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  walletLoader: {
    marginVertical: 16,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  errorText: {
    color: '#FF4444',
    textAlign: 'center',
    marginTop: 8,
  },
  actionsCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  settingsCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  divider: {
    backgroundColor: '#2A2A2A',
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
  },
});

export default ProfileScreen; 