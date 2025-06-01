import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useIngredients } from '@/components/Inventory/getIngredients';
import { Ionicons } from '@expo/vector-icons';

export default function IngredientDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { ingredients } = useIngredients();
  
  const ingredient = ingredients.find(i => i.name === decodeURIComponent(name));

  if (!ingredient) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ingredient not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {ingredient.image_url ? (
          <Image source={{ uri: ingredient.image_url }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={48} color="gray" />
          </View>
        )}
        <Text style={styles.name}>{ingredient.name}</Text>
        <Text style={styles.category}>{ingredient.category}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>{ingredient.quantity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Manufacturing Date:</Text>
          <Text style={styles.detailValue}>{new Date(ingredient.mfg).toLocaleDateString()}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#6c757d',
  },
  detailsContainer: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  detailLabel: {
    fontSize: 16,
    color: '#495057',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
}); 