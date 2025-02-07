import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Searchbar, Button, Avatar, Chip } from 'react-native-paper';

const ClientList = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Mock data - replace with real API data
  const clients = [
    { 
      id: '1', 
      name: 'John Doe', 
      email: 'john.doe@example.com',
      accountValue: '₹2,50,000',
      status: 'active',
      trades: 45
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      email: 'jane.smith@example.com',
      accountValue: '₹1,75,000',
      status: 'active',
      trades: 32
    },
    { 
      id: '3', 
      name: 'Mike Johnson', 
      email: 'mike.j@example.com',
      accountValue: '₹3,20,000',
      status: 'inactive',
      trades: 28
    },
  ];

  const renderClientCard = ({ item }) => (
    <Card style={styles.clientCard}>
      <Card.Content>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <Avatar.Text 
              size={40} 
              label={item.name.split(' ').map(n => n[0]).join('')} 
            />
            <View style={styles.clientDetails}>
              <Text variant="titleMedium">{item.name}</Text>
              <Text variant="bodySmall">{item.email}</Text>
            </View>
          </View>
          <Chip 
            mode="outlined"
            style={[
              styles.statusChip,
              { 
                backgroundColor: item.status === 'active' ? '#e8f5e9' : '#ffebee',
                borderColor: item.status === 'active' ? '#4caf50' : '#f44336'
              }
            ]}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text variant="bodySmall">Account Value</Text>
            <Text variant="titleMedium">{item.accountValue}</Text>
          </View>
          <View style={styles.stat}>
            <Text variant="bodySmall">Total Trades</Text>
            <Text variant="titleMedium">{item.trades}</Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained-tonal" onPress={() => {}}>View Details</Button>
        <Button mode="contained" onPress={() => {}}>Contact</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search clients"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={clients}
        renderItem={renderClientCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
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
    margin: 16,
  },
  listContainer: {
    padding: 16,
  },
  clientCard: {
    marginBottom: 16,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clientDetails: {
    marginLeft: 12,
  },
  statusChip: {
    height: 28,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  stat: {
    alignItems: 'center',
  },
});

export default ClientList;
