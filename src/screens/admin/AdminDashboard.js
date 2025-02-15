import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Avatar, List, Divider, useTheme, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const AdminDashboard = () => {
  const theme = useTheme();

  const stats = [
    { title: 'Total Users', value: '1,234', icon: 'account-group', color: '#2196F3', bgColor: 'rgba(33, 150, 243, 0.2)' },
    { title: 'Active Brokers', value: '45', icon: 'briefcase-account', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.2)' },
    { title: 'Daily Trades', value: '2.5K', icon: 'chart-line', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.2)' },
    { title: 'Revenue', value: '$15.2K', icon: 'currency-usd', color: '#9C27B0', bgColor: 'rgba(156, 39, 176, 0.2)' },
  ];

  const recentActivities = [
    { type: 'user', title: 'New User Registration', description: 'John Doe joined the platform', time: '2 mins ago', icon: 'account-plus' },
    { type: 'trade', title: 'Large Trade Executed', description: 'AAPL: 500 shares @ $180.50', time: '15 mins ago', icon: 'cash-multiple' },
    { type: 'broker', title: 'Broker Approval', description: 'Sarah Smith approved as broker', time: '1 hour ago', icon: 'check-circle' },
    { type: 'alert', title: 'System Alert', description: 'High trading volume detected', time: '2 hours ago', icon: 'alert-circle' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>Admin Dashboard</Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>Welcome back, Admin</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <Card key={index} style={styles.statsCard}>
            <Card.Content>
              <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                <MaterialCommunityIcons name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text variant="titleLarge" style={styles.statValue}>{stat.value}</Text>
              <Text variant="bodyMedium" style={styles.statTitle}>{stat.title}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Card style={styles.activityCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>Recent Activities</Text>
            <IconButton icon="refresh" size={20} onPress={() => {}} />
          </View>
          {recentActivities.map((activity, index) => (
            <React.Fragment key={index}>
              <List.Item
                title={activity.title}
                description={activity.description}
                left={props => (
                  <View style={[styles.activityIcon, { backgroundColor: 'rgba(103, 80, 164, 0.2)' }]}>
                    <MaterialCommunityIcons name={activity.icon} size={24} color={theme.colors.primary} />
                  </View>
                )}
                right={props => <Text variant="bodySmall" style={styles.timeText}>{activity.time}</Text>}
              />
              {index < recentActivities.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.quickActionsCard}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {[
              { title: 'Add User', icon: 'account-plus', color: '#2196F3', bgColor: 'rgba(33, 150, 243, 0.2)' },
              { title: 'Add Broker', icon: 'briefcase-plus', color: '#4CAF50', bgColor: 'rgba(76, 175, 80, 0.2)' },
              { title: 'View Reports', icon: 'file-chart', color: '#FF9800', bgColor: 'rgba(255, 152, 0, 0.2)' },
              { title: 'Settings', icon: 'cog', color: '#9C27B0', bgColor: 'rgba(156, 39, 176, 0.2)' },
            ].map((action, index) => (
              <View key={index} style={styles.quickActionItem}>
                <View style={[styles.quickActionIcon, { backgroundColor: action.bgColor }]}>
                  <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
                </View>
                <Text variant="bodyMedium" style={styles.quickActionTitle}>{action.title}</Text>
              </View>
            ))}
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#666',
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statsCard: {
    width: '46%',
    margin: '2%',
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  statTitle: {
    color: '#666',
    marginTop: 5,
  },
  activityCard: {
    margin: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  timeText: {
    color: '#666',
  },
  quickActionsCard: {
    margin: 10,
    marginBottom: 20,
    elevation: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  quickActionItem: {
    width: '25%',
    alignItems: 'center',
    padding: 10,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  quickActionTitle: {
    textAlign: 'center',
    fontSize: 12,
  },
});

export default AdminDashboard;
