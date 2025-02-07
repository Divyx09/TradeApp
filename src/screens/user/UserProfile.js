import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
} from "react-native";
import {
  Text,
  Card,
  Avatar,
  Button,
  List,
  useTheme as usePaperTheme,
} from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

const UserProfile = () => {
  const { signOut } = useAuth();
  const paperTheme = usePaperTheme();

  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    dematAccount: "ABCD1234567",
    broker: "Sample Broker",
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: paperTheme.colors.background,
    },
    header: {
      alignItems: "center",
      padding: 20,
      backgroundColor: paperTheme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: paperTheme.colors.outline,
    },
    name: {
      fontSize: 24,
      fontWeight: "bold",
      marginTop: 10,
      color: paperTheme.colors.onSurface,
    },
    email: {
      fontSize: 16,
      color: paperTheme.colors.onSurfaceVariant,
      marginTop: 5,
    },
    card: {
      backgroundColor: paperTheme.colors.surface,
      margin: 16,
      borderRadius: 12,
      elevation: 2,
    },
    logoutButton: {
      margin: 16,
      marginTop: 8,
    },
  });

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <Card style={styles.card} mode='elevated'>
        <Card.Content>
          <List.Section>
            <List.Subheader
              style={{ color: paperTheme ? "#0A84FF" : "#007AFF" }}
            >
              Account Information
            </List.Subheader>
            <List.Item
              title='Phone Number'
              titleStyle={{ color: paperTheme ? "#FFFFFF" : "#000000" }}
              description={user.phone}
              descriptionStyle={{ color: paperTheme ? "#B0B0B0" : "#666666" }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon='phone'
                  color={paperTheme ? "#0A84FF" : "#007AFF"}
                />
              )}
            />
            <List.Item
              title='Demat Account'
              titleStyle={{ color: paperTheme ? "#FFFFFF" : "#000000" }}
              description={user.dematAccount}
              descriptionStyle={{ color: paperTheme ? "#B0B0B0" : "#666666" }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon='card-account-details'
                  color={paperTheme ? "#0A84FF" : "#007AFF"}
                />
              )}
            />
            <List.Item
              title='Broker'
              titleStyle={{ color: paperTheme ? "#FFFFFF" : "#000000" }}
              description={user.broker}
              descriptionStyle={{ color: paperTheme ? "#B0B0B0" : "#666666" }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon='briefcase'
                  color={paperTheme ? "#0A84FF" : "#007AFF"}
                />
              )}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode='elevated'>
        <Card.Content>
          <List.Section>
            <List.Subheader
              style={{ color: paperTheme ? "#0A84FF" : "#007AFF" }}
            >
              Settings
            </List.Subheader>
            <List.Item
              title='Notifications'
              titleStyle={{ color: paperTheme ? "#FFFFFF" : "#000000" }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon='bell'
                  color={paperTheme ? "#0A84FF" : "#007AFF"}
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon='chevron-right'
                  color={paperTheme ? "#B0B0B0" : "#666666"}
                />
              )}
              onPress={() => {}}
            />
            <List.Item
              title='Security'
              titleStyle={{ color: paperTheme ? "#FFFFFF" : "#000000" }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon='shield'
                  color={paperTheme ? "#0A84FF" : "#007AFF"}
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon='chevron-right'
                  color={paperTheme ? "#B0B0B0" : "#666666"}
                />
              )}
              onPress={() => {}}
            />
            <List.Item
              title='Help & Support'
              titleStyle={{ color: paperTheme ? "#FFFFFF" : "#000000" }}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon='help-circle'
                  color={paperTheme ? "#0A84FF" : "#007AFF"}
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon='chevron-right'
                  color={paperTheme ? "#B0B0B0" : "#666666"}
                />
              )}
              onPress={() => {}}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Button
        mode='contained'
        onPress={handleSignOut}
        style={[
          styles.logoutButton,
          { backgroundColor: paperTheme ? "#FF453A" : "#FF3B30" },
        ]}
        icon='logout'
      >
        Sign out
      </Button>
    </ScrollView>
  );
};

export default UserProfile;
