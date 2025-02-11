import React, { useEffect } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import {
  requestUserPermission,
  setupNotificationListeners,
} from "./src/services/notificationService";
import Map from "./src/components/Map";

const App = () => {
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = setupNotificationListeners();
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Map />
    </SafeAreaView>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
