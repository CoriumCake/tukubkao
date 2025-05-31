import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, SafeAreaView, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { useIngredients } from '@/components/Inventory/getIngredients';
import { supabase } from '@/lib/supabase';
import { IngredientCard } from '@/components/Inventory/IngredientCard';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/SearchBar/SearchBar';
import { AddItemModal } from '@/components/Inventory/AddItemModal';
import IngredientActions from '@/components/Inventory/IngredientActions';

interface Ingredient {
  name: string;
  category: string;
  user_id: string;
  quantity: number;
  mfg: string;
  exp: string;
  image_url: string;
}

function IngredientModal({ ingredient, visible, onClose }: {
  ingredient: Ingredient;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 20, width: '90%', padding: 20 }}>
          <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 12, right: 12 }}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>{ingredient.name}</Text>
          
          {ingredient.image_url ? (
            <Image source={{ uri: ingredient.image_url }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }} />
          ) : (
            <View style={{ width: '100%', height: 200, borderRadius: 12, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="image-outline" size={48} color="#aaa" />
            </View>
          )}
          
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Details</Text>
            <View style={{ backgroundColor: '#f8f9fa', padding: 12, borderRadius: 8 }}>
              <Text style={{ marginBottom: 4 }}>Category: {ingredient.category}</Text>
              <Text style={{ marginBottom: 4 }}>Quantity: {ingredient.quantity}</Text>
              <Text style={{ marginBottom: 4 }}>Manufacturing Date: {ingredient.mfg}</Text>
              <Text style={{ marginBottom: 4 }}>Expiration Date: {ingredient.exp}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export const InventoryScreen: React.FC = () => {
  const { ingredients, loading, error, refetch } = useIngredients();
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);

  const allCategories = Array.from(new Set(ingredients.map(i => i.category))).sort();
  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!selectedCategory || ingredient.category === selectedCategory)
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSuccess = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleLongPress = (item: Ingredient) => {
    setSelectedIngredient(item);
    setIsModalVisible(true);
  };

  const handlePress = (item: Ingredient) => {
    setSelectedIngredient(item);
    setShowIngredientModal(true);
  };

  const keyExtractor = useCallback((item: Ingredient) => {
    return `${item.name}-${item.user_id}-${item.mfg}-${item.exp}-${item.quantity}`;
  }, []);

  const renderIngredient = ({ item }: { item: Ingredient }) => (
    <IngredientCard
      item={item}
      isSelected={false}
      onPress={() => handlePress(item)}
      onLongPress={() => handleLongPress(item)}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A5B68D" />
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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={styles.screenTitle}>Fridge</Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search ingredients by name..."
        />
        {/* Category filter bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{paddingVertical: 8}}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedCategory && styles.filterChipSelected]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextSelected]}>All</Text>
          </TouchableOpacity>
          {allCategories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.filterChip, selectedCategory === category && styles.filterChipSelected]}
              onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
            >
              <Text style={[styles.filterChipText, selectedCategory === category && styles.filterChipTextSelected]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {loading && !refreshing ? (
          <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>Loading ingredients...</Text>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredIngredients}
            renderItem={renderIngredient}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#A5B68D']}
                tintColor="#A5B68D"
              />
            }
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>No ingredients found.</Text>}
          />
        )}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
        <AddItemModal
          visible={isAddModalVisible}
          onClose={() => setIsAddModalVisible(false)}
          onSuccess={handleSuccess}
        />
        {selectedIngredient && (
          <>
            <IngredientActions
              ingredient={selectedIngredient}
              visible={isModalVisible}
              onClose={() => {
                setIsModalVisible(false);
                setSelectedIngredient(null);
              }}
              onSuccess={handleSuccess}
            />
            <IngredientModal
              ingredient={selectedIngredient}
              visible={showIngredientModal}
              onClose={() => {
                setShowIngredientModal(false);
                setSelectedIngredient(null);
              }}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingVertical: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#A5B68D',
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#A5B68D',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
    textAlign: 'left',
    marginTop: 22,
  },
  filterBar: {
    marginBottom: 8,
    maxHeight: 40,
  },
  filterChip: {
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 32,
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  filterChipSelected: {
    backgroundColor: '#A5B68D',
    borderColor: '#A5B68D',
  },
  filterChipText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 11,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
});