import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Auth from '../../components/Auth'; // adjust if your path differs

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style= { styles.title}>Wellcome</Text>
      <Text style= { styles.subtitle}>Log in to continue</Text>
      <Auth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F2E6',
  },
  title: {
    fontSize: 36,   
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
    color: '#000000',
  },
  subtitle: {
    fontSize: 20,   
    textAlign: 'center',
    marginTop: 0,
    color: '#000000',
  },
});