import React, { useState, useEffect } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Slot, router } from "expo-router";
import LoginScreen from "./screens/login"; // Adjusted import for login screen
import { View, Text, Button, ActivityIndicator } from "react-native";
import SearchMedications from "./screens/searchMedications";
import {
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
} from "react-native-paper";
import CurrentTreatmentsScreen from "./screens/addMedicationScreen";
import MedicationDetailsScreen from "./screens/medicationDetailsScreen";
import {
  fetchAuthSession,
  signIn,
  signUp,
  confirmSignUp,
  getCurrentUser,
} from "aws-amplify/auth"; // Adjusted import for getCurrentUser
import awsconfig from "./aws-exports";
import { Amplify } from "aws-amplify";
import { ConsoleLogger } from "aws-amplify/utils";
import { ApolloProvider } from "@apollo/client";
import client from "./apollo-client"; // Adjust the path if the file is in a different location
import { usePushNotifications } from "./usePushNotifications";
import QuestionnaireScreen from "./screens/questionaireScreen"; // Adjust path as needed
import { useNavigation } from "@react-navigation/native";

Amplify.configure(awsconfig);
ConsoleLogger.LOG_LEVEL = "DEBUG";

console.log("configured!");
const Drawer = createDrawerNavigator();

export default function Layout() {
  const navigation = useNavigation();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial auth check
  const { expoPushToken, notification } = usePushNotifications();

  const data = JSON.stringify(notification, undefined, 2);
  if (data != null) {
    console.log("replacing....");
    // console.log(data2);
    const data2 = JSON.parse(notification.request.content.data.body); // Extract the data properly
    console.log({data2});
    navigation.navigate("Questionnaire", {"data": data2});
  }

  // console.log({data})

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { username, userId, signInDetails } = await getCurrentUser();
        console.log("Authenticated User:", { username, userId, signInDetails });
        setIsAuthenticated(true);
      } catch (error) {
        console.log("No user is logged in:", error.message);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetchAuthSession().then((session) => {
        if (session.isSignedIn) {
          session.signOut();
          console.log("User signed out successfully.");
          setIsAuthenticated(false);
        }
      });
    } catch (error) {
      console.log("Error signing out:", error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }
  // if (data != null) {
  //   return
  // }

  return (
    <ApolloProvider client={client}>
      <PaperProvider theme={DefaultTheme}>
        <Drawer.Navigator initialRouteName="index">
          <Drawer.Screen name="index" options={{ title: "Home" }}>
            {() => <Slot />}
          </Drawer.Screen>
          <Drawer.Screen
            name="Search Medications"
            component={SearchMedications}
          />
          <Drawer.Screen
            name="Add Medications"
            component={CurrentTreatmentsScreen}
          />
          <Drawer.Screen
            name="MedicationDetails"
            component={MedicationDetailsScreen}
          />
          <Drawer.Screen name="Questionnaire" component={QuestionnaireScreen} />

          <Drawer.Screen name="profile" options={{ title: "Profile" }}>
            {() => <Slot />}
          </Drawer.Screen>
          <Drawer.Screen
            name="Logout"
            options={{ title: "Logout" }}
            component={() => (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>Are you sure you want to logout?</Text>
                <Button title="Logout" onPress={handleLogout} color="red" />
              </View>
            )}
          />
        </Drawer.Navigator>
      </PaperProvider>
    </ApolloProvider>
  );
}
