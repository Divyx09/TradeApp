import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, Avatar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

const BrokerProfile = () => {
  const { signOut } = useAuth();

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
        <Avatar.Text size={80} label="BP" />
        <Text style={styles.name} variant="headlineMedium">John Doe</Text>
        <Text style={styles.role} variant="bodyLarge">Senior Broker</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Personal Information</Text>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Email:</Text>
            <Text variant="bodyMedium">broker@example.com</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">License No:</Text>
            <Text variant="bodyMedium">BRK123456</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Experience:</Text>
            <Text variant="bodyMedium">8 years</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Performance Stats</Text>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Active Clients:</Text>
            <Text variant="bodyMedium">45</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Success Rate:</Text>
            <Text variant="bodyMedium">92%</Text>
          </View>
          <View style={styles.infoRow}>
            <Text variant="bodyMedium">Portfolio Growth:</Text>
            <Text variant="bodyMedium">+24.5% YTD</Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSignOut}
        style={styles.signOutButton}
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
