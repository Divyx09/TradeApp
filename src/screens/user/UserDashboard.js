import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

const UserDashboard = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Market Overview</Text>
          {/* Add market overview components here */}
        </Card.Content>
      </Card>
      
      <Card style={styles.card} onPress={()=> navigation.navigate("portfolio")}>
        <Card.Content>
          <Text variant="titleLarge">Your Portfolio Summary</Text>
          {/* Add portfolio summary components here */}
        </Card.Content>
      </Card>
      
      <Card style={styles.card} onPress={()=> navigation.navigate("recentTransection")}>
        <Card.Content>
          <Text variant="titleLarge">Recent Transactions</Text>
          {/* Add recent transactions list here */}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
});

export default UserDashboard;
