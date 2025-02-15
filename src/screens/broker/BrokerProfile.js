import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Avatar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { clearAuthToken } from '../../config/axios';

const BrokerProfile = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await clearAuthToken(); // Clear the auth token
              // Navigate to Login screen after successful sign out
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return 'BP';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={getInitials(user?.name)} />
        <Text style={styles.name} variant="headlineMedium">{user?.name || 'Broker Name'}</Text>
        <Text style={styles.role} variant="bodyLarge">Senior Broker</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Personal Information</Text>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Email:</Text>
            <Text variant="bodyMedium">{user?.email || 'broker@example.com'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">License No:</Text>
            <Text variant="bodyMedium">{user?.licenseNo || 'BRK123456'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Experience:</Text>
            <Text variant="bodyMedium">{user?.experience || '8 years'}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Performance Stats</Text>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Active Clients:</Text>
            <Text variant="bodyMedium">{user?.activeClients || '45'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Success Rate:</Text>
            <Text variant="bodyMedium">{user?.successRate || '92%'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Portfolio Growth:</Text>
            <Text variant="bodyMedium">{user?.portfolioGrowth || '+24.5% YTD'}</Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSignOut}
        style={styles.signOutButton}
        buttonColor="#ff4444"
      >
        Sign Out
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  name: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  role: {
    color: '#666',
    marginTop: 5,
  },
  card: {
    margin: 10,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  signOutButton: {
    margin: 10,
    marginTop: 20,
    marginBottom: 30,
  },
});

export default BrokerProfile;
