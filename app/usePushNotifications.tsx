import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import * as Device from "expo-device";
import { Platform } from "react-native";

export interface PushNotificationState {
  notification?: Notifications.Notification;
  expoPushToken?: string;
}

export const usePushNotifications = (): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const navigation = useNavigation(); // Hook into navigation context

  async function registerForPushNotificationsAsync(): Promise<string | undefined> {
    if (!Device.isDevice) {
      console.log("Must use physical device for push notifications");
      return undefined;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token");
      return undefined;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId: "3b9ad5ad-7800-4f33-a567-baca5b7e698c", // Hardcoded Project ID
    });

    const token = tokenResponse.data;
    console.log("Push token:", token);
    alert(token)

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return token;
  }


Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true, // Set to true if you want sound
      shouldShowAlert: true, // This ensures notifications are displayed while the app is open
      shouldSetBadge: false, // Set to true if you want to update the badge count
    }),
  });

  useEffect(() => {
    // Register for push notifications
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token));

    // Listener for received notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listener for notification responses
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response received:", response);
      console.log({response})
      const data = response.notification.request.content.data;


      // Navigate to the questionnaire screen with data
      if (data) {
        navigation.navigate("Questionnaire", { data });
      }
    });

    // Cleanup listeners
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [navigation]);

  return {
    expoPushToken,
    notification,
  };
};
