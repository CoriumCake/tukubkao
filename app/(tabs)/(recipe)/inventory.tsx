import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useIngredients } from '@/components/Inventory/getIngredients';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import IngredientActions from '@/components/Inventory/IngredientActions';
import { API_URL } from '@/lib/config';

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
  const { ingredients, loading, error, isConnected, refetch } = useIngredients();
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLongPress = (item: Ingredient) => {
    setSelectedIngredient(item);
    setIsModalVisible(true);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSuccess = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const keyExtractor = useCallback((item: Ingredient) => {
    return `${item.name}-${item.user_id}-${item.mfg}-${item.exp}-${item.quantity}`;
  }, []);

  const handleGenerateRecipes = useCallback(async () => {
    if (ingredients.length === 0) {
      Alert.alert('Error', 'No ingredients available');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('Sending request to:', `${API_URL}/api/recipes`);
      const ingredientNames = ingredients.map(ing => ing.name);
      console.log('Ingredients:', ingredientNames);

      const response = await fetch(`${API_URL}/api/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredientNames }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        Alert.alert(
          'Recipe Suggestions',
          data.recipes.join('\n'),
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(data.error || 'Failed to generate recipes');
      }
    } catch (err) {
      console.error('Error details:', err);
      Alert.alert(
        'Error',
        'Network error: Please make sure the backend server is running and the IP address is correct in lib/config.ts'
      );
    } finally {
      setIsGenerating(false);
    }
  }, [ingredients]);

  const renderIngredient = ({ item }: { item: Ingredient }) => (
    <TouchableOpacity 
      style={styles.ingredientCard}
      onPress={() => router.push(`/ingredient/${encodeURIComponent(item.name)}` as any)}
      onLongPress={() => handleLongPress(item)}
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading ingredients...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusBar}>
          <View style={[styles.connectionStatus, { backgroundColor: isConnected ? '#28a745' : '#dc3545' }]}>
            <Text style={styles.connectionText}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateRecipes}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generate Recipes</Text>
          )}
        </TouchableOpacity>
      </View>
      <FlatList
        data={ingredients}
        renderItem={renderIngredient}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007bff']}
            tintColor="#007bff"
          />
        }
      />
      {selectedIngredient && (
        <IngredientActions
          ingredient={selectedIngredient}
          visible={isModalVisible}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedIngredient(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
  retryButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBar: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  connectionStatus: {
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  connectionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  generateButton: {
    backgroundColor: '#28a745',
    padding: 12,
    margin: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
