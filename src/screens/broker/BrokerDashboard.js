import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card } from 'react-native-paper';

const BrokerDashboard = () => {
  // Mock data - replace with real API data
  const stats = {
    totalClients: 45,
    activeClients: 38,
    totalTransactions: 156,
    revenue: '₹25,000',
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Broker Dashboard</Text>
      
      <View style={styles.statsGrid}>
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleLarge">{stats.totalClients}</Text>
            <Text variant="bodyMedium">Total Clients</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleLarge">{stats.activeClients}</Text>
            <Text variant="bodyMedium">Active Clients</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleLarge">{stats.totalTransactions}</Text>
            <Text variant="bodyMedium">Transactions</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleLarge">{stats.revenue}</Text>
            <Text variant="bodyMedium">Revenue</Text>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.recentActivityCard}>
        <Card.Content>
          <Text variant="titleLarge">Recent Activity</Text>
          {/* Add recent activity list here */}
        </Card.Content>
      </Card>

      <Card style={styles.performanceCard}>
        <Card.Content>
          <Text variant="titleLarge">Performance Overview</Text>
          {/* Add performance metrics and charts here */}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statsCard: {
    width: '45%',
    margin: 8,
  },
  recentActivityCard: {
    margin: 16,
  },
  performanceCard: {
    margin: 16,
  },
});

export default BrokerDashboard;
