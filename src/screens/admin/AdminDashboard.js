import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, DataTable, Button } from 'react-native-paper';

const AdminDashboard = () => {
  // Mock data - replace with real API data
  const stats = {
    totalUsers: 1250,
    totalBrokers: 45,
    totalTransactions: 15600,
    revenue: '₹2,50,000',
  };

  const recentActivities = [
    { id: 1, type: 'New User', details: 'John Doe registered', time: '2 mins ago' },
    { id: 2, type: 'New Broker', details: 'ABC Securities onboarded', time: '15 mins ago' },
    { id: 3, type: 'Transaction', details: 'High value trade completed', time: '1 hour ago' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      
      <View style={styles.statsGrid}>
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleLarge">{stats.totalUsers}</Text>
            <Text variant="bodyMedium">Total Users</Text>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleLarge">{stats.totalBrokers}</Text>
            <Text variant="bodyMedium">Total Brokers</Text>
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

      <Card style={styles.activityCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge">Recent Activity</Text>
            <Button mode="text">View All</Button>
          </View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Type</DataTable.Title>
              <DataTable.Title>Details</DataTable.Title>
              <DataTable.Title>Time</DataTable.Title>
            </DataTable.Header>

            {recentActivities.map((activity) => (
              <DataTable.Row key={activity.id}>
                <DataTable.Cell>{activity.type}</DataTable.Cell>
                <DataTable.Cell>{activity.details}</DataTable.Cell>
                <DataTable.Cell>{activity.time}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>

      <Card style={styles.systemCard}>
        <Card.Content>
          <Text variant="titleLarge">System Status</Text>
          <View style={styles.systemStats}>
            <View style={styles.systemStat}>
              <Text variant="bodyMedium">Server Status</Text>
              <Text style={styles.statusGood}>Operational</Text>
            </View>
            <View style={styles.systemStat}>
              <Text variant="bodyMedium">API Status</Text>
              <Text style={styles.statusGood}>Healthy</Text>
            </View>
            <View style={styles.systemStat}>
              <Text variant="bodyMedium">Database Status</Text>
              <Text style={styles.statusGood}>Connected</Text>
            </View>
          </View>
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
  activityCard: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  systemCard: {
    margin: 16,
  },
  systemStats: {
    marginTop: 16,
  },
  systemStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusGood: {
    color: '#4caf50',
    fontWeight: 'bold',
  },
});

export default AdminDashboard;
