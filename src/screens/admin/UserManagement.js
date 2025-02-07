import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, DataTable, Button, Searchbar, FAB } from 'react-native-paper';

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock user data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'user', status: 'Inactive' },
  ];

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search users"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>User List</Text>
            
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Name</DataTable.Title>
                <DataTable.Title>Email</DataTable.Title>
                <DataTable.Title>Role</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
                <DataTable.Title>Actions</DataTable.Title>
              </DataTable.Header>

              {users.map((user) => (
                <DataTable.Row key={user.id}>
                  <DataTable.Cell>{user.name}</DataTable.Cell>
                  <DataTable.Cell>{user.email}</DataTable.Cell>
                  <DataTable.Cell>{user.role}</DataTable.Cell>
                  <DataTable.Cell>{user.status}</DataTable.Cell>
                  <DataTable.Cell>
                    <Button
                      mode="text"
                      compact
                      onPress={() => console.log('Edit user:', user.id)}
                    >
                      Edit
                    </Button>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => console.log('Add new user')}
        label="Add User"
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
  title: {
    marginBottom: 15,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default UserManagement;
