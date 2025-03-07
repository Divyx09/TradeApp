import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelfieVerification from '../screens/auth/kyc/SelfieVerification';
import AadharVerification from '../screens/auth/kyc/AadharVerification';
import PanVerification from '../screens/auth/kyc/PanVerification';
import KYCComplete from '../screens/auth/kyc/KYCComplete';

const Stack = createNativeStackNavigator();

const KYCNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="SelfieVerification" component={SelfieVerification} />
      <Stack.Screen name="AadharVerification" component={AadharVerification} />
      <Stack.Screen name="PanVerification" component={PanVerification} />
      <Stack.Screen name="KYCComplete" component={KYCComplete} />
    </Stack.Navigator>
  );
};

export default KYCNavigator;