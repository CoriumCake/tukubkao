import React from 'react';
import { View, StyleSheet } from 'react-native';
import AddIngredientForm from '@/components/Inventory/add';

const AddIngredientScreen = () => {
  return (
    <View style={styles.container}>
      <AddIngredientForm />
    </View>
  );
};

export default AddIngredientScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 