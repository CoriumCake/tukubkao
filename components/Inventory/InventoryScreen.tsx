import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { useIngredients } from '@/components/Inventory/getIngredients';
import { API_URL } from '@/lib/config';
import { Accelerometer } from 'expo-sensors';
import { supabase } from '@/lib/supabase';
import { RecipeCard } from '@/components/RecipeCard';
import { IngredientCard } from '@/components/Inventory/IngredientCard';
import { RecipeModal } from '@/components/Inventory/RecipeModal';
import { RecipeList } from '@/components/Inventory/RecipeList';
import { GenerateButton } from '@/components/Inventory/GenerateButton';
import { AddItemModal } from '@/components/Inventory/AddItemModal';
import IngredientActions from '@/components/Inventory/IngredientActions';
import { Ionicons } from '@expo/vector-icons';

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
  title: string;
  recipe_desc?: string;
  ingred: string[];
}

interface RecipeDetails {
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
      if (newSet.has(item.name)) {
        newSet.delete(item.name);
      } else {
        newSet.add(item.name);
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
  }, [refetch]);

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
      setSelectedRecipe(recipeDetails);
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
        .select('title, recipe_desc, ingred');
      if (error) throw error;
      setSavedRecipes(data || []);
    } catch (err) {
      console.error('Error fetching saved recipes:', err);
    }
  };

  const renderIngredient = ({ item }: { item: Ingredient }) => (
    <IngredientCard
      item={item}
      isSelected={selectedIngredients.has(item.name)}
      onPress={() => toggleIngredientSelection(item)}
      onLongPress={() => handleLongPress(item)}
    />
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
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
          <GenerateButton
            onPress={handleGenerateRecipes}
            isGenerating={isGenerating}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add-circle" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
        {showRecipeList ? (
          <RecipeList
            recipes={currentRecipes}
            onRecipeClick={handleRecipeClick}
            onClose={() => setShowRecipeList(false)}
          />
        ) : (
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
          recipe={selectedRecipe}
          visible={isRecipeModalVisible}
          onClose={() => setIsRecipeModalVisible(false)}
          onSave={handleSaveRecipe}
        />
        <AddItemModal
          visible={isAddModalVisible}
          onClose={() => setIsAddModalVisible(false)}
          onSuccess={handleSuccess}
        />
        {savedRecipes.map((recipe, idx) => (
          <RecipeCard
            key={idx}
            title={recipe.title}
            information={recipe.recipe_desc || ''}
            ingredients={Array.isArray(recipe.ingred) ? recipe.ingred : []}
            onPress={() => {
              setSelectedRecipe({
                title: recipe.title,
                recipe_desc: recipe.recipe_desc || '',
                ingred: recipe.ingred
              });
              setIsRecipeModalVisible(true);
            }}
          />
        ))}
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    padding: 8,
  },
}); 