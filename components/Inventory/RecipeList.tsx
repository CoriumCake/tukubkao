import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Recipe {
  title: string;
  recipe_desc?: string;
  ingred: string[];
}

interface RecipeListProps {
  recipes: Recipe[];
  onRecipeClick: (recipe: Recipe) => void;
  onClose: () => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  onRecipeClick,
  onClose,
}) => {
  return (
    <View style={styles.recipeListContainer}>
      <View style={styles.header}>
        <Text style={styles.recipeListTitle}>All Possible Recipes</Text>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.recipeListHint}>💡 Shake your device to get a random recipe suggestion!</Text>
      <ScrollView style={styles.recipeScrollView}>
        {recipes.map((recipe, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recipeCard}
            onPress={() => onRecipeClick(recipe)}
          >
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <View style={styles.recipeFooter}>
              <Text style={styles.recipeIngredients}>
                Ingredients: {recipe.ingred.join(', ')}
              </Text>
              <Ionicons name="chevron-forward" size={24} color="#A5B68D" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  recipeListContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeListTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  recipeListHint: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  recipeScrollView: {
    flex: 1,
  },
  recipeCard: {
    backgroundColor: '#fff',
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
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  recipeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeIngredients: {
    fontSize: 12,
    color: '#888',
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#A5B68D',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 