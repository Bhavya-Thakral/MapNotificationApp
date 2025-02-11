import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native";

const LocationForm = ({ location, address }) => {
  const [fcm, setFcm] = useState(null);
  useEffect(() => {
    const retreiveToken = async () => {
      const token = await AsyncStorage.getItem("FCM");
      setFcm(token);
    };
    retreiveToken();
  }, []);
  return (
    <ScrollView style={styles.main}>
      <View style={styles.container}>
        {fcm ? (
          <>
            <Text style={styles.title}>FCM token</Text>

            <TextInput
              defaultValue={fcm}
              multiline={true}
              style={{
                borderWidth: 1,
              }}
            />
          </>
        ) : (
          <Text style={styles.title}>
            provide notification permissions from setting and restart the app.
          </Text>
        )}
        <Text style={styles.title}>Location Details</Text>
        {location && (
          <>
            <Text style={styles.info}>Latitude: {location.latitude}</Text>
            <Text style={styles.info}>Longitude: {location.longitude}</Text>
            <Text style={styles.info}>Address: {address}</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 0.4,
  },
  container: {
    flex: 0.4,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontWeight: "600",
    fontSize: 20,
  },
});

export default LocationForm;
