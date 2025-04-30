import { View } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddIngredientForm from '@/components/Inventory/add';

export default function AddIngredientScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
      <AddIngredientForm />
      </View>
    </SafeAreaView>
  );
}
