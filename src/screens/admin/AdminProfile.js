import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Avatar, List } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { clearAuthToken } from '../../config/axios';

const AdminProfile = ({ navigation }) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await clearAuthToken();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

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
              await signOut();
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label="AA" />
        <Text style={styles.name} variant="headlineMedium">Admin User</Text>
        <Text style={styles.role} variant="bodyLarge">System Administrator</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Account Information</Text>
          <List.Item
            title="Email"
            description="admin@example.com"
            left={props => <List.Icon {...props} icon="email" />}
          />
          <List.Item
            title="Role"
            description="System Administrator"
            left={props => <List.Icon {...props} icon="shield-account" />}
          />
          <List.Item
            title="Last Login"
            description="Today, 10:30 AM"
            left={props => <List.Icon {...props} icon="clock" />}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">System Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">1,234</Text>
              <Text variant="bodyMedium">Total Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">105</Text>
              <Text variant="bodyMedium">Brokers</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium">50K</Text>
              <Text variant="bodyMedium">Trades</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Recent Activities</Text>
          <List.Item
            title="User Management"
            description="Added new broker account"
            left={props => <List.Icon {...props} icon="account-plus" />}
          />
          <List.Item
            title="System Update"
            description="Updated trading parameters"
            left={props => <List.Icon {...props} icon="update" />}
          />
          <List.Item
            title="Security Alert"
            description="Reviewed login attempts"
            left={props => <List.Icon {...props} icon="shield-alert" />}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 20,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  buttonContainer: {
    padding: 16,
    marginTop: 8,
  },
  logoutButton: {
    backgroundColor: '#f44336',
    margin: 20,
    marginTop: 'auto',
  },
});

export default AdminProfile;
