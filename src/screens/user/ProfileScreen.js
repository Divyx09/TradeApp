import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { clearAuthToken } from '../../config/axios';

const ProfileScreen = ({ navigation }) => {
  const handleLogout = async () => {
    await clearAuthToken();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Profile</Text>
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: 20,
  },
});

export default ProfileScreen; 