import React from 'react';
import { View, StyleSheet } from 'react-native';
import Auth from '../../components/Auth'; // adjust if your path differs

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Auth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F2E6',
  }
});