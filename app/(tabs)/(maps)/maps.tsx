import { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
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
};

export default function MapsScreen() {
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState('Makro 1');
  const [customMarker, setCustomMarker] = useState(null); // เก็บตำแหน่งที่ผู้ใช้คลิก
  const mapRef = useRef(null);

  useEffect(() => {
    // ตั้งค่าตำแหน่งที่ต้องการเอง
    const predefinedLocation = {
      latitude: 14.980815253986936,
      longitude: 102.07641840766442,
    };
    setLocation(predefinedLocation); // กำหนดตำแหน่งเอง
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

  // ฟังก์ชันจับตำแหน่งเมื่อคลิกบนแผนที่
  const handleMapPress = (e) => {
    const coordinate = e.nativeEvent.coordinate;
    setCustomMarker(coordinate); // เก็บตำแหน่งที่กด
  };

  // เปลี่ยนสถานที่ที่เลือกใน picker
  const handleLocationChange = (value) => {
    setSelectedLocation(value);
    goToSelectedLocation(); // เลื่อนไปที่ตำแหน่งที่เลือก
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: currentMarker.latitude,
          longitude: currentMarker.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handleMapPress} // จับการกดที่แผนที่
      >
        {/* ปักหมุดที่ตำแหน่ง Makro ที่เลือก */}
        <Marker
          coordinate={{
            latitude: currentMarker.latitude,
            longitude: currentMarker.longitude,
          }}
          title={currentMarker.label}
        />

        {/* ตำแหน่งผู้ใช้ */}
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="ตำแหน่งของคุณ"
            pinColor="blue"
          />
        )}

        {/* ปักหมุดตำแหน่งที่ผู้ใช้คลิก */}
        {customMarker && (
          <Marker
            coordinate={customMarker}
            title="ตำแหน่งที่เลือก"
            pinColor="green"
          />
        )}
      </MapView>

      {/* ปุ่ม Search Bar อยู่กลางบน */}
      <View style={styles.searchBar}>
        <RNPickerSelect
          onValueChange={handleLocationChange} // เปลี่ยนสถานที่เมื่อเลือก
          value={selectedLocation}
          items={[
            { label: LOCATIONS['Makro 1'].label, value: 'Makro 1' },
            { label: LOCATIONS['Makro 2'].label, value: 'Makro 2' },
          ]}
          style={pickerStyles}
          placeholder={{ label: '', value: null }} // เอาคำว่า 'Select an item' ออก
        />
      </View>

      {/* ปุ่มไปยังตำแหน่งของตัวเอง */}
      <View style={styles.controls}>
        <Button title="ไปยังตำแหน่งของฉัน" onPress={goToUserLocation} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    position: 'absolute',
    top: 40, // คุมตำแหน่งแนวตั้ง
    left: '10%',
    right: '10%',
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    paddingHorizontal: 10,
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
    fontWeight: 'bold',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    backgroundColor: 'white',
    color: 'black',
    marginBottom: 8,
    fontWeight: 'bold',
  },
};
