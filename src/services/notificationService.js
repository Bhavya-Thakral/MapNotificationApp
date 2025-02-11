import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { Alert, Linking, Platform } from "react-native";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

// Requests user permission for push notifications.
export async function requestUserPermission() {
  try {
    let permission;

    if (Platform.OS === "android") {
      const androidVersion = parseInt(Platform.Version, 10);

      if (androidVersion >= 33) {
        permission = PERMISSIONS.ANDROID.POST_NOTIFICATIONS;
      } else {
        await getFCMToken();
        return;
      }
    } else if (Platform.OS === "ios") {
      permission = PERMISSIONS.IOS.NOTIFICATIONS;
    } else {
      console.warn("Unsupported platform for push notifications.");
      return;
    }

    if (!permission) {
      console.warn("No valid permission found.");
      return;
    }

    // Check current permission status
    const currentStatus = await check(permission);
    if (currentStatus === RESULTS.GRANTED) {
      await getFCMToken();
      return;
    }

    // Request permission
    const authStatus = await request(permission);

    if (authStatus === RESULTS.GRANTED) {
      await getFCMToken();
    } else if (authStatus === RESULTS.BLOCKED) {
      showSettingsAlert();
    } else {
      Alert.alert("Permission Denied", "Enable notifications in settings.");
    }
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    Alert.alert("Permission Error", error.message);
  }
}

// Show an alert if permission is blocked.
function showSettingsAlert() {
  Alert.alert(
    "Permission Required",
    "Notifications are blocked. Please enable them in settings.",
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ]
  );
}

//Gets the Firebase Cloud Messaging (FCM) token.
async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    Alert.alert("FCM", token);
    AsyncStorage.setItem('FCM',token);
    
  } catch (error) {
    console.error("Error fetching FCM token:", error);
  }
}

// Sets up Firebase Cloud Messaging (FCM) notification listeners.
export function setupNotificationListeners() {
  console.log("🔹 Setting up notification listeners...");

  // Foreground notifications
  const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
    try {
      Alert.alert(
        remoteMessage.notification?.title || "New Message",
        remoteMessage.notification?.body || "You have a new notification"
      );
    } catch (error) {
      console.error("Error handling foreground message:", error);
    }
  });

  // Background message handler
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    try {
      console.log("Background message handled:", remoteMessage);
    } catch (error) {
      console.error("Error handling background message:", error);
    }
  });

  // App opened from notification in background
  const unsubscribeOnNotificationOpenedApp =
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log("App opened from background notification:", remoteMessage);
    });

  // App opened from notification when it was quit
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("App opened from quit state notification:", remoteMessage);
      }
    });

  // Cleanup function
  return () => {
    unsubscribeOnMessage();
    unsubscribeOnNotificationOpenedApp();
  };
}
