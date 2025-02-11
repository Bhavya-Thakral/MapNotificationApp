import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Linking,
  Text,
  Button,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import LocationForm from "./LocationForm";
import Geocoder from "react-native-geocoding";
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";

Geocoder.init("AIzaSyBcOv-s3SC7mNvpZNiuIacqtpLxh6NpuZo");

const Map = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [permissionStatus, setPermissionStatus] = useState(null); // Track permission status

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const getPermissionType = () => {
    return Platform.OS === "android"
      ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  };

  const checkLocationPermission = async () => {
    let permission = getPermissionType();
    let result = await check(permission);

    if (result === RESULTS.GRANTED) {
      setPermissionStatus(RESULTS.GRANTED);
    } else {
      setPermissionStatus(result);
    }
  };

  const askForPermission = async () => {
    let permission = getPermissionType();
    let result = await request(permission);

    if (result === RESULTS.GRANTED) {
      setPermissionStatus(RESULTS.GRANTED);
    } else if (result === RESULTS.BLOCKED) {
      setPermissionStatus(RESULTS.BLOCKED);
      showSettingsAlert();
    } else {
      setPermissionStatus(RESULTS.DENIED);
    }
  };

  const showSettingsAlert = () => {
    Alert.alert(
      "Permission Required",
      "Location access is blocked. Please enable it in settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
  };

  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);

    try {
      const response = await Geocoder.from(
        coordinate.latitude,
        coordinate.longitude
      );
      const addressComponent = response.results[0].formatted_address;
      setAddress(addressComponent);
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  return (
    <View style={styles.container}>
      {permissionStatus === RESULTS.GRANTED ? (
        <MapView
          style={styles.map}
          onPress={handleMapPress}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {selectedLocation && <Marker coordinate={selectedLocation} />}
        </MapView>
      ) : (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Location permission is required to use the map. Please allow access.
          </Text>
          <Button title="Grant Permission" onPress={askForPermission} />
        </View>
      )}
      <LocationForm location={selectedLocation} address={address} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 0.6,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
});

export default Map;
