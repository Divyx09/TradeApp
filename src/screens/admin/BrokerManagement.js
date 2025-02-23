import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Searchbar,
  List,
  Avatar,
  FAB,
  Menu,
  Divider,
  IconButton,
  useTheme,
  Badge,
  Portal,
  Modal,
  TextInput,
  Button,
} from "react-native-paper";
import axios from "../../config/axios";

const BrokerManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    license: "",
    experience: "",
    specialization: "",
  });
  const theme = useTheme();

  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/brokers");
      setBrokers(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch brokers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  const handleCreateBroker = async () => {
    try {
      setLoading(true);
      await axios.post("/api/admin/brokers", formData);
      setModalVisible(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        license: "",
        experience: "",
        specialization: "",
      });
      fetchBrokers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create broker");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBroker = async (brokerId, data) => {
    try {
      setLoading(true);
      await axios.put(`/api/admin/brokers/${brokerId}`, data);
      fetchBrokers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update broker");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBroker = async (brokerId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/admin/brokers/${brokerId}`);
      fetchBrokers();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete broker");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return { solid: "#4CAF50", light: "rgba(76, 175, 80, 0.2)" };
      case "inactive":
        return { solid: "#F44336", light: "rgba(244, 67, 54, 0.2)" };
      case "pending":
        return { solid: "#FF9800", light: "rgba(255, 152, 0, 0.2)" };
      default:
        return { solid: "#999", light: "rgba(153, 153, 153, 0.2)" };
    }
  };

  const filteredBrokers = brokers.filter(
    (broker) =>
      broker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broker.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const brokerStats = {
    total: brokers.length,
    active: brokers.filter((b) => b.status === "active").length,
    successRate: brokers.length
      ? Math.round(
          (brokers.filter((b) => b.status === "active").length /
            brokers.length) *
            100
        )
      : 0,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Broker Management
        </Text>
        <Text variant="bodyLarge" style={styles.headerSubtitle}>
          Manage platform brokers
        </Text>
      </View>

      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statValue}>
              {brokerStats.total}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Total Brokers
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statValue}>
              {brokerStats.active}
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Active
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statValue}>
              {brokerStats.successRate}%
            </Text>
            <Text variant="bodyMedium" style={styles.statLabel}>
              Success Rate
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.searchCard}>
        <Card.Content>
      <Searchbar
            placeholder="Search brokers..."
        onChangeText={setSearchQuery}
        value={searchQuery}
            style={styles.searchbar}
          />
          </Card.Content>
        </Card>

      <Card style={styles.listCard}>
          <Card.Content>
          <View style={styles.listHeader}>
            <Text variant="titleLarge" style={styles.listTitle}>
              Broker List
            </Text>
            <IconButton icon="filter-variant" onPress={() => {}} />
              </View>
          {filteredBrokers.map((broker, index) => (
            <React.Fragment key={broker._id}>
              <List.Item
                title={broker.name}
                description={`License: ${broker.license}`}
                left={(props) => (
                  <Avatar.Text
                    size={40}
                    label={broker.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                    style={{ backgroundColor: "rgba(103, 80, 164, 0.2)" }}
                  />
                )}
                right={(props) => (
                  <View style={styles.brokerActions}>
                    <Badge size={22} style={[styles.clientBadge]}>
                      {broker.clients}
                    </Badge>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(broker.status).light,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(broker.status).solid },
                        ]}
                      >
                        {broker.status}
                      </Text>
              </View>
                    <Menu
                      visible={menuVisible && selectedBroker === broker._id}
                      onDismiss={() => setMenuVisible(false)}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          onPress={() => {
                            setSelectedBroker(broker._id);
                            setMenuVisible(true);
                          }}
                        />
                      }
                    >
                      <Menu.Item
                        onPress={() => {
                          setMenuVisible(false);
                          handleUpdateBroker(broker._id, { status: "active" });
                        }}
                        title="Activate"
                      />
                      <Menu.Item
                        onPress={() => {
                          setMenuVisible(false);
                          handleUpdateBroker(broker._id, { status: "inactive" });
                        }}
                        title="Deactivate"
                      />
                      <Divider />
                      <Menu.Item
                        onPress={() => {
                          setMenuVisible(false);
                          handleDeleteBroker(broker._id);
                        }}
                        title="Delete"
                        titleStyle={{ color: "#F44336" }}
                      />
                    </Menu>
              </View>
                )}
              />
              {index < filteredBrokers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          </Card.Content>
        </Card>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Add New Broker
          </Text>
          <TextInput
            label="Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
          />
          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            style={styles.input}
            mode="outlined"
            secureTextEntry
          />
          <TextInput
            label="Phone"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
          />
          <TextInput
            label="License Number"
            value={formData.license}
            onChangeText={(text) => setFormData({ ...formData, license: text })}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Experience (years)"
            value={formData.experience}
            onChangeText={(text) => setFormData({ ...formData, experience: text })}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          <TextInput
            label="Specialization"
            value={formData.specialization}
            onChangeText={(text) =>
              setFormData({ ...formData, specialization: text })
            }
            style={styles.input}
            mode="outlined"
          />
          <Button
            mode="contained"
            onPress={handleCreateBroker}
            style={styles.submitButton}
            loading={loading}
          >
            Create Broker
          </Button>
        </Modal>
      </Portal>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        label="Add Broker"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#666",
    marginTop: 5,
  },
  statsCard: {
    margin: 10,
    elevation: 2,
  },
  statsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontWeight: "bold",
    color: "#2196F3",
  },
  statLabel: {
    color: "#666",
    marginTop: 5,
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#e0e0e0",
  },
  searchCard: {
    margin: 10,
    elevation: 2,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: "#f5f5f5",
  },
  listCard: {
    margin: 10,
    elevation: 2,
    flex: 1,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  listTitle: {
    fontWeight: "bold",
  },
  brokerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  clientBadge: {
    backgroundColor: "#2196F3",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 10,
  },
});

export default BrokerManagement;
