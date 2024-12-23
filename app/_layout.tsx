import React, { useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Slot } from 'expo-router';
import LoginScreen from './screens/login'; // Adjusted import for login screen
import { View, Text, Button } from 'react-native';
import SearchMedications from './screens/searchMedications'
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";
import CurrentTreatmentsScreen from './screens/addMedicationScreen'
import MedicationDetailsScreen from './screens/medicationDetailsScreen'

const Drawer = createDrawerNavigator();

export default function Layout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (<PaperProvider theme={DefaultTheme}>
    <Drawer.Navigator initialRouteName="index">
      <Drawer.Screen name="index" options={{ title: 'Home' }}>
        {() => <Slot />}
      </Drawer.Screen>
      <Drawer.Screen name="Search Medications" component={SearchMedications} />
      <Drawer.Screen name="Add Medications" component={CurrentTreatmentsScreen} />
      <Drawer.Screen name="MedicationDetails" component={MedicationDetailsScreen} />


      <Drawer.Screen name="profile" options={{ title: 'Profile' }}>
        {() => <Slot />}
      </Drawer.Screen>
      <Drawer.Screen
        name="Logout"
        options={{ title: 'Logout' }}
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Are you sure you want to logout?</Text>
            <Button title="Logout" onPress={handleLogout} color="red" />
          </View>
        )}
      />
    </Drawer.Navigator>
    </PaperProvider>
  );
}
