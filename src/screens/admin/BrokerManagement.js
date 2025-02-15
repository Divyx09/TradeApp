import React, { useState } from "react";
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
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const BrokerManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const theme = useTheme();

  const brokers = [
    {
      id: 1,
      name: "Robert Smith",
      email: "robert@brokerage.com",
      status: "active",
      clients: 45,
      performance: "+24.5%",
      license: "BRK123456",
    },
    {
      id: 2,
      name: "Emma Johnson",
      email: "emma@brokerage.com",
      status: "inactive",
      clients: 32,
      performance: "+18.2%",
      license: "BRK789012",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "michael@brokerage.com",
      status: "pending",
      clients: 28,
      performance: "+21.7%",
      license: "BRK345678",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return { solid: '#4CAF50', light: 'rgba(76, 175, 80, 0.2)' };
      case "inactive":
        return { solid: '#F44336', light: 'rgba(244, 67, 54, 0.2)' };
      case "pending":
        return { solid: '#FF9800', light: 'rgba(255, 152, 0, 0.2)' };
      default:
        return { solid: '#999', light: 'rgba(153, 153, 153, 0.2)' };
    }
  };

  const handleBrokerAction = (action, broker) => {
    setMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant='headlineMedium' style={styles.headerTitle}>
          Broker Management
        </Text>
        <Text variant='bodyLarge' style={styles.headerSubtitle}>
          Manage platform brokers
        </Text>
      </View>

      <Card style={styles.statsCard}>
        <Card.Content style={styles.statsContent}>
          <View style={styles.statItem}>
            <Text variant='headlineMedium' style={styles.statValue}>
              105
            </Text>
            <Text variant='bodyMedium' style={styles.statLabel}>
              Total Brokers
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant='headlineMedium' style={styles.statValue}>
              85
            </Text>
            <Text variant='bodyMedium' style={styles.statLabel}>
              Active
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant='headlineMedium' style={styles.statValue}>
              92%
            </Text>
            <Text variant='bodyMedium' style={styles.statLabel}>
              Success Rate
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.searchCard}>
        <Card.Content>
          <Searchbar
            placeholder='Search brokers...'
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
        </Card.Content>
      </Card>

      <Card style={styles.listCard}>
        <Card.Content>
          <View style={styles.listHeader}>
            <Text variant='titleLarge' style={styles.listTitle}>
              Broker List
            </Text>
            <IconButton icon='filter-variant' onPress={() => {}} />
          </View>
          {brokers.map((broker, index) => (
            <React.Fragment key={broker.id}>
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
                    style={{ backgroundColor: 'rgba(103, 80, 164, 0.2)' }}
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
                      visible={menuVisible && selectedBroker === broker.id}
                      onDismiss={() => setMenuVisible(false)}
                      anchor={
                        <IconButton
                          icon='dots-vertical'
                          onPress={() => {
                            setSelectedBroker(broker.id);
                            setMenuVisible(true);
                          }}
                        />
                      }
                    >
                      <Menu.Item
                        onPress={() => handleBrokerAction("view", broker)}
                        title='View Details'
                      />
                      <Menu.Item
                        onPress={() => handleBrokerAction("edit", broker)}
                        title='Edit'
                      />
                      <Menu.Item
                        onPress={() => handleBrokerAction("disable", broker)}
                        title='Disable'
                      />
                      <Divider />
                      <Menu.Item
                        onPress={() => handleBrokerAction("delete", broker)}
                        title='Delete'
                        titleStyle={{ color: "#F44336" }}
                      />
                    </Menu>
                  </View>
                )}
              />
              {index < brokers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>

      <FAB
        icon='plus'
        style={styles.fab}
        onPress={() => console.log("Add new broker")}
        label='Add Broker'
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
});

export default BrokerManagement;
