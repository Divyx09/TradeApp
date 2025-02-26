import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { WalletProvider } from './src/context/WalletContext';

export default function App() {
  return (
    <PaperProvider>
      <WalletProvider>
        <AppNavigator />
      </WalletProvider>
    </PaperProvider>
  );
}
