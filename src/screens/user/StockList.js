import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Searchbar } from 'react-native-paper';

const StockList = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Mock data - replace with real API data
  const stocks = [
    { id: '1', symbol: 'RELIANCE', name: 'Reliance Industries', price: '2450.75', change: '+1.5%' },
    { id: '2', symbol: 'TCS', name: 'Tata Consultancy Services', price: '3550.25', change: '-0.8%' },
    { id: '3', symbol: 'HDFC', name: 'HDFC Bank', price: '1680.90', change: '+0.5%' },
  ];

  const renderStockItem = ({ item }) => (
    <Card style={styles.stockCard}>
      <Card.Content>
        <View style={styles.stockHeader}>
          <View>
            <Text variant="titleMedium">{item.symbol}</Text>
            <Text variant="bodyMedium">{item.name}</Text>
          </View>
          <View>
            <Text variant="titleMedium">₹{item.price}</Text>
            <Text 
              style={{ 
                color: item.change.startsWith('+') ? 'green' : 'red' 
              }}
            >
              {item.change}
            </Text>
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={() => {}}>Buy</Button>
        <Button mode="outlined" onPress={() => {}}>Sell</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search stocks"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={stocks}
        renderItem={renderStockItem}
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
  stockCard: {
    marginBottom: 16,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});

export default StockList;
