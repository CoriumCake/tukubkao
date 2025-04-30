import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useIngredients } from '@/components/Inventory/getIngredients';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Ingredient {
  name: string;
  category: string;
  user_id: string;
  quantity: number;
  mfg: string;
  exp: string;
  image_url: string;
}

export default function InventoryScreen() {
  const { ingredients, loading, error } = useIngredients();

  const renderIngredient = ({ item }: { item: Ingredient }) => (
    <TouchableOpacity 
      style={styles.ingredientCard}
      onPress={() => router.push(`/ingredient/${encodeURIComponent(item.name)}` as any)}
    >
      <View style={styles.ingredientInfo}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.ingredientImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={24} color="gray" />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.ingredientName}>{item.name}</Text>
          <Text style={styles.ingredientCategory}>{item.category}</Text>
          <Text style={styles.ingredientQuantity}>Quantity: {item.quantity}</Text>
          <Text style={styles.ingredientMfg}>MFG: {new Date(item.mfg).toLocaleDateString()}</Text>
          <Text style={styles.ingredientExp}>EXP: {new Date(item.exp).toLocaleDateString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={ingredients}
        renderItem={renderIngredient}
        keyExtractor={(item) => `${item.name}-${item.user_id}-${item.mfg}`}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  ingredientCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ingredientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ingredientCategory: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  ingredientQuantity: {
    fontSize: 14,
    color: '#495057',
  },
  ingredientMfg: {
    fontSize: 14,
    color: '#495057',
  },
  ingredientExp: {
    fontSize: 14,
    color: '#495057',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
