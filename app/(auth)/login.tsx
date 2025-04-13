import React from 'react';
import { View } from 'react-native';
import Auth from '../../components/Auth'; // adjust if your path differs

export default function LoginScreen() {
  return (
    <View style={{ flex: 1 }}>
      <Auth />
    </View>
  );
}
