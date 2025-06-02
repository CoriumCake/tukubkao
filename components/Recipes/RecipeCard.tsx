import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ThemedText } from '../ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface RecipeCardProps {
  title: string;
  information: string;
  ingredients?: string[];
  onPress?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  information,
  ingredients,
  onPress,
}) => {
  return (
    <TouchableOpacity 
      style={styles.recipeCard}
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.textContainer}>
        <Text style={styles.recipeTitle}>{title}</Text>
        {ingredients && (
          <Text style={styles.ingredientCategory}>
            Ingredients: {ingredients.join(', ')}
          </Text>
        )}
        <Text style={styles.recipeDescription} numberOfLines={3}>
          {information}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#A5B68D" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  ingredientCategory: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#495057',
  },
}); 