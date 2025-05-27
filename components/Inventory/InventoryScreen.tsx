import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, SafeAreaView, StatusBar, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { useIngredients, deleteRecipe } from '@/components/Inventory/getIngredients';
import { API_URL } from '@/lib/config';
import { Accelerometer } from 'expo-sensors';
import { supabase } from '@/lib/supabase';
import { IngredientCard } from '@/components/Inventory/IngredientCard';
import { RecipeModal } from '@/components/Recipes/RecipeModal';
import { RecipeList } from '@/components/Recipes/RecipeList';
import { AddItemModal } from '@/components/Inventory/AddItemModal';
import IngredientActions from '@/components/Inventory/IngredientActions';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { NotificationRequest } from 'expo-notifications';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface Ingredient {
  name: string;
  category: string;
  user_id: string;
  quantity: number;
  mfg: string;
  exp: string;
  image_url: string;
}

interface Recipe {
  id: string;
  title: string;
  recipe_desc?: string;
  ingred: string[];
}

interface RecipeDetails {
  id: string;
  title: string;
  recipe_desc: string;
  ingred: string[];
}

export const InventoryScreen: React.FC = () => {
  const { ingredients, loading, error, refetch } = useIngredients();
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[]>([]);
  const [isShakeEnabled, setIsShakeEnabled] = useState(false);
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const [showRecipeList, setShowRecipeList] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetails | null>(null);
  const [isRecipeModalVisible, setIsRecipeModalVisible] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const allCategories = Array.from(new Set(ingredients.map(i => i.category))).sort();
  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!selectedCategory || ingredient.category === selectedCategory)
  );

  useEffect(() => {
    let subscription: any;
    
    if (isShakeEnabled) {
      Accelerometer.setUpdateInterval(100);
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();
        
        if (magnitude > 1.2 && now - lastShakeTime > 1000) {
          setLastShakeTime(now);
          handleShake();
        }
      });
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isShakeEnabled, currentRecipes, lastShakeTime]);

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  // Request notification permissions
  useEffect(() => {
    async function requestNotificationPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please enable notifications to receive expiry alerts.');
      }
    }
    requestNotificationPermissions();
  }, []);

  // Test function for expiring ingredients
  const testExpiringNotification = useCallback(async () => {
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Ingredients Expiring Soon!',
        body: `Your Milk expiring on ${threeDaysFromNow.toLocaleDateString()}`,
        data: { date: threeDaysFromNow.toISOString() },
      },
      trigger: null, // Send immediately
    });
  }, []);

  // Clear old notifications
  const clearOldNotifications = useCallback(async () => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const oldNotifications = scheduledNotifications.filter(
        (notification: NotificationRequest): boolean => {
          if (!notification.trigger || typeof notification.trigger !== 'object') return false;
          const trigger = notification.trigger as { timestamp?: number };
          if (!trigger.timestamp) return false;
          return new Date(trigger.timestamp) < twentyFourHoursAgo;
        }
      );
      
      if (oldNotifications.length > 0) {
        await Promise.all(
          oldNotifications.map(notification => 
            Notifications.cancelScheduledNotificationAsync(notification.identifier)
          )
        );
      }
      // Dismiss all delivered notifications (Android only; no effect on iOS)
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing old notifications:', error);
    }
  }, []);

  // Check for expiring ingredients
  const checkExpiringIngredients = useCallback(async () => {
    await clearOldNotifications(); // Clear old notifications first
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    const expiringIngredients = ingredients.filter(ingredient => {
      if (!ingredient.exp) return false;
      
      const expiryDate = new Date(ingredient.exp);
      expiryDate.setHours(0, 0, 0, 0); // Reset time to start of day
      
      const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays === 3;
    });

    if (expiringIngredients.length > 0) {
      for (const ingredient of expiringIngredients) {
        const expiryDate = new Date(ingredient.exp);
        expiryDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Ingredients Expiring Soon!',
            body: `Your ${ingredient.name} has ${diffDays} days left before expiration`,
            data: { ingredient },
          },
          trigger: null, // Send immediately
        });
      }
    }
  }, [ingredients]);

  // Check for expiring ingredients when ingredients list changes
  useEffect(() => {
    if (ingredients && ingredients.length > 0) {
      checkExpiringIngredients();
    }
  }, [ingredients, checkExpiringIngredients]);

  const handleShake = () => {
    if (currentRecipes.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentRecipes.length);
      const randomRecipe = currentRecipes[randomIndex];
      setCurrentRecipes([randomRecipe]);
    }
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No user session');
      }

      const recipeData = {
        title: recipe.title,
        recipe_desc: recipe.recipe_desc,
        ingred: recipe.ingred
      };

      const { error } = await supabase
        .from('recipes')
        .insert([recipeData]);

      if (error) throw error;

      Alert.alert('Success', 'Recipe saved successfully!');
      fetchSavedRecipes();
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      Alert.alert('Error', 'Failed to save recipe');
    }
  };

  const handleLongPress = (item: Ingredient) => {
    setSelectedIngredient(item);
    setIsModalVisible(true);
  };

  const toggleIngredientSelection = (item: Ingredient) => {
    setSelectedIngredients(prev => {
      const newSet = new Set(prev);
      const itemKey = `${item.name}-${item.user_id}-${item.mfg}-${item.exp}-${item.quantity}`;
      
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleSuccess = useCallback(async () => {
    await refetch();
    // Check for expiring ingredients after update
    setTimeout(() => {
      checkExpiringIngredients();
    }, 1000); // Small delay to ensure ingredients are loaded
  }, [refetch, checkExpiringIngredients]);

  const keyExtractor = useCallback((item: Ingredient) => {
    return `${item.name}-${item.user_id}-${item.mfg}-${item.exp}-${item.quantity}`;
  }, []);

  const handleGenerateRecipes = useCallback(async () => {
    if (selectedIngredients.size === 0) {
      Alert.alert('Error', 'Please select at least one ingredient');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedIngredientNames = Array.from(selectedIngredients);
      const response = await fetch(`${API_URL}/api/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: selectedIngredientNames }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const recipes = data.recipes.map((title: string) => ({
          title,
          ingred: selectedIngredientNames
        }));
        setCurrentRecipes(recipes);
        setIsShakeEnabled(true);
        setShowRecipeList(true);
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
  }, [selectedIngredients]);

  const handleRecipeClick = async (recipe: Recipe) => {
    try {
      setIsGenerating(true);
      const response = await fetch(`${API_URL}/api/recipe-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title: recipe.title,
          ingredients: recipe.ingred 
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get recipe details: ${response.status}`);
      }

      const recipeDetails = await response.json();
      setSelectedRecipe({
        id: recipe.id,
        title: recipeDetails.title,
        recipe_desc: recipeDetails.recipe_desc,
        ingred: recipeDetails.ingred
      });
      setIsRecipeModalVisible(true);
    } catch (error: any) {
      console.error('Error fetching recipe details:', error);
      Alert.alert(
        'Error',
        `Failed to fetch recipe details: ${error?.message || 'Unknown error'}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchSavedRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, recipe_desc, ingred');
      if (error) throw error;
      setSavedRecipes(data || []);
    } catch (err) {
      console.error('Error fetching saved recipes:', err);
    }
  };

  const handleDeleteRecipe = async (recipe: RecipeDetails) => {
    try {
      await deleteRecipe(recipe.id);
      Alert.alert('Success', 'Recipe deleted successfully!');
      fetchSavedRecipes();
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      Alert.alert('Error', 'Failed to delete recipe');
    }
  };

  const renderIngredient = ({ item }: { item: Ingredient }) => (
    <IngredientCard
      item={item}
      isSelected={selectedIngredients.has(`${item.name}-${item.user_id}-${item.mfg}-${item.exp}-${item.quantity}`)}
      onPress={() => toggleIngredientSelection(item)}
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
    <SafeAreaView style={{ flex: 1, paddingTop: StatusBar.currentHeight }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Fridge</Text>
          <TouchableOpacity 
            style={styles.testButton}
            onPress={clearOldNotifications}
          >
            <Ionicons name="notifications" size={24} color="#A5B68D" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchBar}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search ingredients by name..."
        />
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
        {showRecipeList ? (
          <RecipeList
            recipes={currentRecipes}
            onRecipeClick={handleRecipeClick}
            onClose={() => setShowRecipeList(false)}
          />
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
          />
        )}
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
        <RecipeModal
          recipe={selectedRecipe as RecipeDetails}
          visible={isRecipeModalVisible}
          onClose={() => setIsRecipeModalVisible(false)}
          onSave={handleSaveRecipe}
          isSaved={!!selectedRecipe && savedRecipes.some(r => r.id === selectedRecipe.id)}
          onDelete={handleDeleteRecipe}
        />
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
        {selectedIngredients.size > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={handleGenerateRecipes}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="sparkles" size={28} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

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
  listContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#A5B68D',
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
    marginTop: 24,
    marginBottom: 16,
    color: '#222',
    textAlign: 'left',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 8,
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
  recipeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recipeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeImage: {
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
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeDesc: {
    fontSize: 14,
    color: '#495057',
  },
  testButton: {
    padding: 8,
  },
}); 