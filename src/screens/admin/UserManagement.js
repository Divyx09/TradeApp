import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Text, Card, Searchbar, List, Avatar, FAB, Menu, Divider, IconButton, useTheme, Portal, Modal, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import axios, { setAuthToken, initializeAuthToken } from '../../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const UserManagement = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeComponent = async () => {
      await checkAuth();
      await initializeAuthToken();
      fetchUsers();
    };
    
    initializeComponent();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('userData');
      
      if (!token || !userData) {
        console.log('No token or user data found');
        navigation.replace('Login');
        return;
      }

      const user = JSON.parse(userData);
      if (user.role !== 'admin') {
        console.log('User is not admin:', user.role);
        navigation.replace('Login');
        return;
      }

      // Re-set the token to ensure it's in axios headers
      await setAuthToken(token);
      console.log('Auth check passed, token refreshed');
    } catch (error) {
      console.error('Auth check error:', error);
      navigation.replace('Login');
    }
  };

  const handleCreateUser = async () => {
    try {
      setLoading(true);
      console.log('Creating user with data:', formData);
      
      // Validate required fields
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const response = await axios.post('/api/admin/users', formData);
      console.log('User creation response:', response.data);
      
      setModalVisible(false);
      setFormData({ name: '', email: '', password: '', phone: '' });
      setError(null);
      fetchUsers();
      
    } catch (error) {
      console.error('Error creating user:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId, data) => {
    try {
      setLoading(true);
      await axios.put(`/api/admin/users/${userId}`, data);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/admin/users/${userId}`);
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

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

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="account-group" size={64} color="#ccc" />
      <Text style={styles.emptyStateText}>No users found</Text>
      <Text style={styles.emptyStateSubtext}>Add new users using the button below</Text>
    </View>
  );

  const renderUserCard = (user, index) => (
    <Animated.View
      style={[
        styles.userCard,
        {
          opacity: fadeAnim,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          setSelectedUser(user._id);
          setMenuVisible(true);
        }}
      >
        <Card elevation={2} style={styles.userCardContent}>
          <Card.Content>
            <View style={styles.userHeader}>
              <Avatar.Text
                size={50}
                label={user.name.split(' ').map(n => n[0]).join('')}
                style={styles.userAvatar}
              />
              <View style={styles.userInfo}>
                <Text variant="titleMedium" style={styles.userName}>{user.name}</Text>
                <Text variant="bodyMedium" style={styles.userEmail}>{user.email}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status).light }]}>
                <Text style={[styles.statusText, { color: getStatusColor(user.status).solid }]}>
                  {user.status}
                </Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleUpdateUser(user._id, { status: 'active' })}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteUser(user._id)}
                style={[styles.actionButton, styles.deleteButton]}
              />
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text variant="headlineMedium" style={styles.headerTitle}>User Management</Text>
          <View style={styles.headerStats}>
            <View style={styles.statBadge}>
              <Text style={styles.statNumber}>{userStats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statNumber}>{userStats.active}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statNumber}>{userStats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>
      </View>

      <Searchbar
        placeholder="Search users..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        icon={() => <MaterialCommunityIcons name="magnify" size={24} color="#666" />}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator style={styles.loader} size="large" />
        ) : filteredUsers.length === 0 ? (
          renderEmptyState()
        ) : (
          filteredUsers.map((user, index) => renderUserCard(user, index))
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setError(null);
          }}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <MaterialCommunityIcons name="account-plus" size={32} color={theme.colors.primary} />
            <Text variant="headlineSmall" style={styles.modalTitle}>Add New User</Text>
          </View>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          <TextInput
            label="Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={styles.input}
            mode="outlined"
            error={!formData.name && error}
            left={<TextInput.Icon icon="account" />}
          />
          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
            error={!formData.email && error}
            left={<TextInput.Icon icon="email" />}
          />
          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            style={styles.input}
            mode="outlined"
            secureTextEntry
            error={!formData.password && error}
            left={<TextInput.Icon icon="lock" />}
          />
          <TextInput
            label="Phone"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
            left={<TextInput.Icon icon="phone" />}
          />
          <Button
            mode="contained"
            onPress={handleCreateUser}
            style={styles.submitButton}
            loading={loading}
            icon="account-plus"
          >
            Create User
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        label="Add User"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        extended
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
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statBadge: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchbar: {
    margin: 16,
    elevation: 2,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    marginBottom: 12,
  },
  userCardContent: {
    borderRadius: 10,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: 'rgba(103, 80, 164, 0.2)',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontWeight: '600',
  },
  userEmail: {
    color: '#666',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    margin: 0,
  },
  deleteButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#666',
    marginTop: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 15,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    marginTop: 10,
    fontWeight: '600',
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 10,
    paddingVertical: 8,
  },
  errorText: {
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 28,
  },
  loader: {
    marginTop: 40,
  },
});

export default UserManagement;
