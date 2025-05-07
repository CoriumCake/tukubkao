import { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import RNPickerSelect from 'react-native-picker-select';

const LOCATIONS = {
  'Makro 1': {
    label: 'Makro Nakhon Ratchasima 3 (Save one)',
    latitude: 14.958343273865705,
    longitude: 102.04892984612721,
  },
  'Makro 2': {
    label: 'Makro Nakhon Ratchasima',
    latitude: 14.994651237067568,
    longitude: 102.09862303850923,
  },
} as const;

type LocationKey = keyof typeof LOCATIONS;

export default function MapsScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationKey>('Makro 1');
  const [customMarker, setCustomMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapView>(null);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setMapError('Location permission not granted');
        return;
      }

      // Set initial location
      const predefinedLocation = {
        latitude: 14.980815253986936,
        longitude: 102.07641840766442,
      };
      setLocation(predefinedLocation);
      
      // Try to get current location
      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.log('Could not get current location, using predefined location');
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Error initializing map');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeMap();
  }, []);

  const goToUserLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const currentMarker = LOCATIONS[selectedLocation];

  const goToSelectedLocation = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: currentMarker.latitude,
        longitude: currentMarker.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const handleMapPress = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const coordinate = e.nativeEvent.coordinate;
    setCustomMarker(coordinate);
  };

  const handleLocationChange = (value: LocationKey) => {
    setSelectedLocation(value);
    goToSelectedLocation();
  };

  return (
    <SafeAreaView style={styles.container}>
      {mapError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{mapError}</Text>
          <Button 
            title="Retry" 
            onPress={() => {
              setMapError(null);
              setIsMapReady(false);
              setIsLoading(true);
              initializeMap();
            }} 
          />
        </View>
      )}
      <View style={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Initializing map...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: currentMarker.latitude,
              longitude: currentMarker.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={handleMapPress}
            onMapReady={() => {
              console.log('Map is ready');
              setIsMapReady(true);
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={true}
            showsTraffic={false}
            showsBuildings={true}
            showsIndoors={true}
            loadingEnabled={true}
            loadingIndicatorColor="#666666"
            loadingBackgroundColor="#eeeeee"
          >
            <Marker
              coordinate={{
                latitude: currentMarker.latitude,
                longitude: currentMarker.longitude,
              }}
              title={currentMarker.label}
              description="Selected location"
            />

            {location && (
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title="Your Location"
                description="Your current location"
                pinColor="blue"
              />
            )}

            {customMarker && (
              <Marker
                coordinate={customMarker}
                title="Selected Location"
                description="Custom selected location"
                pinColor="green"
              />
            )}
          </MapView>
        )}
        {!isMapReady && !isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        )}
      </View>

      <View style={styles.searchBar}>
        <RNPickerSelect
          onValueChange={handleLocationChange}
          value={selectedLocation}
          items={[
            { label: LOCATIONS['Makro 1'].label, value: 'Makro 1' },
            { label: LOCATIONS['Makro 2'].label, value: 'Makro 2' },
          ]}
          style={pickerStyles}
          placeholder={{ label: '', value: null }}
        />
      </View>

      <View style={styles.controls}>
        <Button title="Locate My Location" onPress={goToUserLocation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    position: 'relative',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,0,0,0.7)',
    padding: 10,
    zIndex: 2,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchBar: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 70 : 40,
    left: 20,
    right: 20,
    zIndex: 5,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    height: 20,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 12,
    borderRadius: 12,
  },
});

const pickerStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    backgroundColor: 'white',
    color: 'black',
    marginBottom: 8,
    fontWeight: '700' as const,
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    backgroundColor: 'white',
    color: 'black',
    marginBottom: 8,
    fontWeight: '700' as const,
  },
};
