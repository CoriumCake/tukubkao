import { View, TouchableOpacity, Text, FlatList, Image, StyleSheet, ScrollView, Modal, Alert, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddRecipeModal from '@/components/Recipes/AddRecipeModal';
import SearchBar from '@/components/SearchBar/SearchBar';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { RecipeModal } from '@/components/Recipes/RecipeModal';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';

// Define the Recipe type to match Supabase data
interface Recipe {
  id: string;
  title: string;
  image_url?: string;
  ingred: string[];
  recipe_desc?: string;
}

function RecipeCard({ item, onPress, onLongPress }: { item: Recipe; onPress: () => void; onLongPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.recipeCard} onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.recipeInfo}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.recipeImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={24} color="gray" />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.recipeName}>{item.title}</Text>
          <Text style={styles.recipeDesc} numberOfLines={2}>
            {item.recipe_desc || (item.ingred ? `Ingredients: ${item.ingred.join(', ')}` : '')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function RecipeActions({ recipe, visible, onClose, onEdit, onDelete }: {
  recipe: Recipe;
  visible: boolean;
  onClose: () => void;
  onEdit: (updated: Recipe) => void;
  onDelete: (id: string) => void;
}) {
  const [editedRecipe, setEditedRecipe] = useState<Recipe>(recipe);
  const [isLoading, setIsLoading] = useState(false);

  // Reset editedRecipe when modal opens
  useEffect(() => {
    if (visible) {
      setEditedRecipe(recipe);
    }
  }, [visible, recipe]);

  // Image picker logic
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setEditedRecipe({ ...editedRecipe, image_url: result.assets[0].uri });
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('recipes')
        .update({
          title: editedRecipe.title,
          recipe_desc: editedRecipe.recipe_desc,
          ingred: editedRecipe.ingred,
          image_url: editedRecipe.image_url,
        })
        .eq('id', recipe.id);
      if (error) throw error;
      onEdit(editedRecipe);
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to update recipe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            setIsLoading(true);
            try {
              const { error } = await supabase.from('recipes').delete().eq('id', recipe.id);
              if (error) throw error;
              onDelete(recipe.id);
              onClose();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete recipe');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 20, width: '90%', padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Edit Recipe</Text>
          {/* Image Picker */}
          <TouchableOpacity onPress={pickImage} style={{ alignSelf: 'center', marginBottom: 16 }}>
            {editedRecipe.image_url ? (
              <Image source={{ uri: editedRecipe.image_url }} style={{ width: 120, height: 120, borderRadius: 8 }} />
            ) : (
              <View style={{ width: 120, height: 120, borderRadius: 8, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="image-outline" size={32} color="#aaa" />
                <Text style={{ color: '#aaa' }}>Add Image</Text>
              </View>
            )}
          </TouchableOpacity>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, marginBottom: 12 }}
            value={editedRecipe.title}
            onChangeText={t => setEditedRecipe({ ...editedRecipe, title: t })}
            placeholder="Title"
          />
          <TextInput
            style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, marginBottom: 12, height: 80 }}
            value={editedRecipe.recipe_desc || ''}
            onChangeText={t => setEditedRecipe({ ...editedRecipe, recipe_desc: t })}
            placeholder="Description"
            multiline
          />
          <TextInput
            style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, marginBottom: 12 }}
            value={Array.isArray(editedRecipe.ingred) ? editedRecipe.ingred.join(', ') : ''}
            onChangeText={t => setEditedRecipe({ ...editedRecipe, ingred: t.split(',').map(i => i.trim()).filter(Boolean) })}
            placeholder="Ingredients (comma separated)"
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
            <TouchableOpacity
              style={{ backgroundColor: '#e74c3c', padding: 12, borderRadius: 8, flex: 1, marginRight: 8, alignItems: 'center' }}
              onPress={handleDelete}
              disabled={isLoading}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 4 }}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#28a745', padding: 12, borderRadius: 8, flex: 1, marginLeft: 8, alignItems: 'center' }}
              onPress={handleUpdate}
              disabled={isLoading}
            >
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: 'bold', marginTop: 4 }}>Update</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 12, right: 12 }}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function RecipesScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showRecipeActions, setShowRecipeActions] = useState(false);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, image_url, ingred, recipe_desc');
      if (error) throw error;
      setRecipes(data || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase.channel('public:recipes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recipes' },
        payload => {
          if (payload.eventType === 'INSERT') {
            setRecipes(prev => [...prev, payload.new as Recipe]);
          } else if (payload.eventType === 'UPDATE') {
            setRecipes(prev => prev.map(r => r.id === (payload.new as Recipe).id ? payload.new as Recipe : r));
          } else if (payload.eventType === 'DELETE') {
            setRecipes(prev => prev.filter(r => r.id !== (payload.old as Recipe).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSuccess = () => {
    fetchRecipes();
  };

  // Get all unique ingredients from recipes
  const allIngredients = Array.from(
    new Set(
      recipes.flatMap(r => Array.isArray(r.ingred) ? r.ingred : [])
    )
  ).sort();

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
    && (!selectedIngredient || (Array.isArray(recipe.ingred) && recipe.ingred.includes(selectedIngredient)))
  );

  const handleRecipePress = (item: Recipe) => {
    setSelectedRecipe(item);
    setShowRecipeModal(true);
  };

  const handleRecipeLongPress = (item: Recipe) => {
    setSelectedRecipe(item);
    setShowRecipeActions(true);
  };

  const handleRecipeEdit = (updated: Recipe) => {
    setRecipes(recipes => recipes.map(r => r.id === updated.id ? updated : r));
  };
  const handleRecipeDelete = (id: string) => {
    setRecipes(recipes => recipes.filter(r => r.id !== id));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={styles.screenTitle}>Recipes</Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search recipes by title..."
        />
        {/* Ingredient filter bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{paddingVertical: 8}}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedIngredient && styles.filterChipSelected]}
            onPress={() => setSelectedIngredient(null)}
          >
            <Text style={[styles.filterChipText, !selectedIngredient && styles.filterChipTextSelected]}>All</Text>
          </TouchableOpacity>
          {allIngredients.map(ingredient => (
            <TouchableOpacity
              key={ingredient}
              style={[styles.filterChip, selectedIngredient === ingredient && styles.filterChipSelected]}
              onPress={() => setSelectedIngredient(selectedIngredient === ingredient ? null : ingredient)}
            >
              <Text style={[styles.filterChipText, selectedIngredient === ingredient && styles.filterChipTextSelected]}>{ingredient}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {loading ? (
          <Text style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>Loading recipes...</Text>
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <RecipeCard
                item={item}
                onPress={() => handleRecipePress(item)}
                onLongPress={() => handleRecipeLongPress(item)}
              />
            )}
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#aaa', marginTop: 32 }}>No recipes found.</Text>}
          />
        )}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
        <AddRecipeModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSuccess={handleSuccess}
        />
        {selectedRecipe && (
          <RecipeActions
            recipe={selectedRecipe}
            visible={showRecipeActions}
            onClose={() => setShowRecipeActions(false)}
            onEdit={handleRecipeEdit}
            onDelete={handleRecipeDelete}
          />
        )}
        {selectedRecipe && (
          <RecipeModal
            recipe={{
              id: selectedRecipe.id,
              title: selectedRecipe.title,
              recipe_desc: selectedRecipe.recipe_desc || '',
              ingred: selectedRecipe.ingred
            }}
            visible={showRecipeModal}
            onClose={() => setShowRecipeModal(false)}
            onSave={() => {}}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Add styles for RecipeCard, matching IngredientCard
const styles = StyleSheet.create({
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
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
    textAlign: 'left',
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
  filterBar: {
    marginBottom: 8,
    maxHeight: 40, // Optional: control overflow
  },
  filterChip: {
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 32, // <-- Fix height
    justifyContent: 'center', // <-- Center text vertically
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
