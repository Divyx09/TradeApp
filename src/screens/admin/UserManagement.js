import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Searchbar, List, Avatar, FAB, Menu, Divider, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const theme = useTheme();

  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', role: 'user', joinDate: '15 Jan 2024' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', role: 'user', joinDate: '10 Jan 2024' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'active', role: 'user', joinDate: '5 Jan 2024' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', status: 'pending', role: 'user', joinDate: '1 Jan 2024' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { solid: '#4CAF50', light: 'rgba(76, 175, 80, 0.2)' };
      case 'inactive':
        return { solid: '#F44336', light: 'rgba(244, 67, 54, 0.2)' };
      case 'pending':
        return { solid: '#FF9800', light: 'rgba(255, 152, 0, 0.2)' };
      default:
        return { solid: '#999', light: 'rgba(153, 153, 153, 0.2)' };
    }
  };

  const handleUserAction = (action, user) => {
    // Implement user actions here
    console.log(action, user);
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>User Management</Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>Manage platform users</Text>
      </View>

      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statValue}>1,234</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statValue}>892</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statValue}>45</Text>
            <Text variant="bodyMedium" style={styles.statLabel}>Pending</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.searchCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search users..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
        </Card.Content>
      </Card>

      <Card style={styles.listCard}>
        <Card.Content>
          <View style={styles.listHeader}>
            <Text variant="titleLarge" style={styles.listTitle}>User List</Text>
            <IconButton icon="filter-variant" onPress={() => {}} />
          </View>
          {users.map((user, index) => (
            <React.Fragment key={user.id}>
              <List.Item
                title={user.name}
                description={user.email}
                left={props => (
                  <Avatar.Text
                    size={40}
                    label={user.name.split(' ').map(n => n[0]).join('')}
                    style={{ backgroundColor: 'rgba(103, 80, 164, 0.2)' }}
                  />
                )}
                right={props => (
                  <View style={styles.userActions}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status).light }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(user.status).solid }]}>{user.status}</Text>
                    </View>
                    <Menu
                      visible={menuVisible && selectedUser === user.id}
                      onDismiss={() => setMenuVisible(false)}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          onPress={() => {
                            setSelectedUser(user.id);
                            setMenuVisible(true);
                          }}
                        />
                      }
                    >
                      <Menu.Item onPress={() => handleUserAction('edit', user)} title="Edit" />
                      <Menu.Item onPress={() => handleUserAction('disable', user)} title="Disable" />
                      <Menu.Item onPress={() => handleUserAction('delete', user)} title="Delete" />
                    </Menu>
                  </View>
                )}
              />
              {index < users.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

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
  statsCard: {
    margin: 10,
    elevation: 2,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    color: '#666',
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e0e0e0',
  },
  searchCard: {
    margin: 10,
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  listCard: {
    margin: 10,
    elevation: 2,
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {
    fontWeight: 'bold',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default UserManagement;
