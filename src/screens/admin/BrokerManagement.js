import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, DataTable, Button, Searchbar, FAB } from 'react-native-paper';

const BrokerManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock broker data
  const brokers = [
    { id: 1, name: 'Alex Thompson', email: 'alex@example.com', clients: 45, status: 'Active' },
    { id: 2, name: 'Sarah Wilson', email: 'sarah@example.com', clients: 32, status: 'Active' },
    { id: 3, name: 'David Brown', email: 'david@example.com', clients: 28, status: 'Inactive' },
  ];

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search brokers"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>Broker List</Text>
            
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Name</DataTable.Title>
                <DataTable.Title>Email</DataTable.Title>
                <DataTable.Title numeric>Clients</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {brokers.map((broker) => (
                <DataTable.Row key={broker.id}>
                  <DataTable.Cell>{broker.name}</DataTable.Cell>
                  <DataTable.Cell>{broker.email}</DataTable.Cell>
                  <DataTable.Cell numeric>{broker.clients}</DataTable.Cell>
                  <DataTable.Cell>{broker.status}</DataTable.Cell>
                  <DataTable.Cell>
                    <Button
                      mode="text"
                      compact
                      onPress={() => console.log('Edit broker:', broker.id)}
                    >
                      Edit
                    </Button>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>Broker Statistics</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium">105</Text>
                <Text variant="bodyMedium">Total Brokers</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium">92</Text>
                <Text variant="bodyMedium">Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium">13</Text>
                <Text variant="bodyMedium">Inactive</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Add new broker')}
        label="Add Broker"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 10,
    elevation: 2,
  },
  card: {
    margin: 10,
    elevation: 2,
  },
  statsCard: {
    margin: 10,
    marginTop: 0,
    elevation: 2,
  },
  title: {
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default BrokerManagement;
