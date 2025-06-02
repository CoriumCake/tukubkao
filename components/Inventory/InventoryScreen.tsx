import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, SafeAreaView, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIngredients } from '@/components/Inventory/getIngredients';
import { supabase } from '@/lib/supabase';
import { IngredientCard } from '@/components/Inventory/IngredientCard';
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '@/components/SearchBar/SearchBar';
import { AddItemModal } from '@/components/Inventory/AddItemModal';
import IngredientActions from '@/components/Inventory/IngredientActions';
import { RecipeModal } from '@/components/Recipes/RecipeModal';
import { requestNotificationPermissions, scheduleNotification } from '@/lib/notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

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
  const insets = useSafeAreaInsets();
  const { ingredients, loading, error, refetch } = useIngredients();
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [showRecipeListModal, setShowRecipeListModal] = useState(false);
  const [possibleRecipes, setPossibleRecipes] = useState<string[]>([]);
  const [selectedRecipeTitle, setSelectedRecipeTitle] = useState<string | null>(null);
  const [showRecipeDetailsModal, setShowRecipeDetailsModal] = useState(false);
  const [currentRecipeDetails, setCurrentRecipeDetails] = useState<any>(null);
  const [isLoadingRecipeDetails, setIsLoadingRecipeDetails] = useState(false);
  const notifiedIngredients = React.useRef<Set<string>>(new Set());

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

  const getIngredientKey = (item: Ingredient) => {
    return `${item.name}-${item.user_id}-${item.mfg}-${item.exp}-${item.quantity}`;
  };

  const handlePress = (item: Ingredient) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      const key = getIngredientKey(item);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleLongPress = (item: Ingredient) => {
    setSelectedIngredient(item);
    setIsModalVisible(true);
  };

  const keyExtractor = useCallback((item: Ingredient) => {
    return `${item.name}-${item.user_id}-${item.mfg}-${item.exp}-${item.quantity}`;
  }, []);

  const renderIngredient = ({ item }: { item: Ingredient }) => (
    <IngredientCard
      item={item}
      isSelected={selectedIngredients.has(getIngredientKey(item))}
      onPress={() => handlePress(item)}
      onLongPress={() => handleLongPress(item)}
    />
  );

  const handleGenerateRecipe = async () => {
    if (selectedIngredients.size === 0) {
      Alert.alert('No Ingredients Selected', 'Please select at least one ingredient to generate a recipe.');
      return;
    }

    if (selectedIngredients.size > 10) {
      Alert.alert('Too Many Ingredients', 'Please select a maximum of 10 ingredients.');
      return;
    }

    setIsGeneratingRecipe(true);
    try {
      const selectedItems = ingredients.filter(item => 
        selectedIngredients.has(getIngredientKey(item))
      );

      const response = await fetch('http://10.0.2.2:3000/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: selectedItems.map(item => item.name),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate recipe');
      }

      const data = await response.json();
      
      if (data.recipes && data.recipes.length > 0) {
        setPossibleRecipes(data.recipes);
        setShowRecipeListModal(true);
      } else {
        Alert.alert('No Recipes Found', 'No recipes could be made with the selected ingredients.');
        // Clear selections only if no recipes found
        setSelectedIngredients(new Set());
      }
    } catch (error) {
      console.error('Recipe generation error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to generate recipe. Please try again.');
      // Clear selections on error
      setSelectedIngredients(new Set());
    } finally {
      // Ensure loading state is cleared in all cases
      setIsGeneratingRecipe(false);
    }
  };

  const handleRecipeSelect = async (title: string) => {
    setSelectedRecipeTitle(title);
    setShowRecipeListModal(false);
    setShowRecipeDetailsModal(true);
    setIsLoadingRecipeDetails(true);
    
    try {
      const selectedItems = ingredients.filter(item => 
        selectedIngredients.has(getIngredientKey(item))
      );

      const response = await fetch('http://10.0.2.2:3000/api/recipe-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          ingredients: selectedItems.map(item => item.name),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get recipe details');
      }

      const data = await response.json();
      setCurrentRecipeDetails(data);
      // Clear selections after successfully getting recipe details
      setSelectedIngredients(new Set());
    } catch (error) {
      console.error('Recipe details error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to get recipe details. Please try again.');
      // Clear selections on error
      setSelectedIngredients(new Set());
      // Close the modal on error
      setShowRecipeDetailsModal(false);
    } finally {
      setIsLoadingRecipeDetails(false);
    }
  };

  const handleSaveRecipe = async (recipe: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No user session');
      }

      const { error } = await supabase.from('recipes').insert([
        {
          title: recipe.title,
          recipe_desc: recipe.recipe_desc,
          ingred: recipe.ingred,
          user_id: session.user.id,
        },
      ]);

      if (error) throw error;
      Alert.alert('Success', 'Recipe saved successfully!');
      setShowRecipeDetailsModal(false);
    } catch (error) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    }
  };

  useEffect(() => {
    async function checkExpiringIngredients() {
      await requestNotificationPermissions();
      const now = new Date();
      ingredients.forEach((ingredient) => {
        const expDate = new Date(ingredient.exp);
        const diffTime = expDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 3) {
          const key = `${ingredient.name}-${ingredient.exp}`;
          if (!notifiedIngredients.current.has(key)) {
            scheduleNotification(
              'Ingredient Expiring Soon',
              `${ingredient.name} will expire in ${diffDays} day${diffDays === 1 ? '' : 's'}.`,
              { type: SchedulableTriggerInputTypes.DATE, date: new Date(Date.now() + 1000) }
            );
            notifiedIngredients.current.add(key);
          }
        }
      });
    }
    if (ingredients.length > 0) {
      checkExpiringIngredients();
    }
  }, [ingredients]);

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
      <View style={{ flex: 1, padding: 16, paddingTop: insets.top }}>
        <View style={styles.headerContainer}>
          <Text style={styles.screenTitle}>Fridge</Text>
          <TouchableOpacity
            style={[styles.generateButton, selectedIngredients.size === 0 && styles.generateButtonDisabled]}
            onPress={handleGenerateRecipe}
            disabled={selectedIngredients.size === 0 || isGeneratingRecipe}
          >
            {isGeneratingRecipe ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons 
                name="restaurant-outline" 
                size={24} 
                color={selectedIngredients.size === 0 ? '#999' : '#fff'} 
              />
            )}
          </TouchableOpacity>
        </View>
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
        {/* Recipe List Modal */}
        <Modal
          visible={showRecipeListModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowRecipeListModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Possible Recipes</Text>
                <TouchableOpacity 
                  onPress={() => setShowRecipeListModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {possibleRecipes.map((recipe, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.recipeItem}
                    onPress={() => handleRecipeSelect(recipe)}
                  >
                    <Text style={styles.recipeItemText}>{recipe}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Recipe Details Modal */}
        {currentRecipeDetails && (
          <RecipeModal
            recipe={{
              id: '',
              title: currentRecipeDetails.title,
              recipe_desc: currentRecipeDetails.recipe_desc,
              ingred: currentRecipeDetails.ingred
            }}
            visible={showRecipeDetailsModal}
            onClose={() => {
              if (!isLoadingRecipeDetails) {
                setShowRecipeDetailsModal(false);
                setShowRecipeListModal(true);
              }
            }}
            onSave={handleSaveRecipe}
            isLoading={isLoadingRecipeDetails}
          />
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: '#A5B68D',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  generateButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  loadingIndicator: {
    position: 'absolute',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: '80%',
  },
  recipeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recipeItemText: {
    fontSize: 16,
    color: '#333',
  },
});