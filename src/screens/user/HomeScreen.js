import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome to Trade App</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Your trading journey starts here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    marginTop: 10,
    color: '#666',
  },
});

export default HomeScreen; 