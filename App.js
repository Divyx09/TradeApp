import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        {/* <StatusBar style="auto" /> */}
        <AppNavigator />
      </PaperProvider>
    </AuthProvider>
  );
}
