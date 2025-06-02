import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';

interface Recipe {
  id: string;
  title: string;
  recipe_desc?: string;
  ingred?: string[];
  category?: string;
}

interface RecipeListProps {
  recipes: Recipe[];
  onRecipePress: (recipe: Recipe) => void;
}

export const RecipeList: React.FC<RecipeListProps> = ({ recipes, onRecipePress }) => {
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>(recipes);
  const [isShaking, setIsShaking] = useState(false);
  const shakeAnimation = new Animated.Value(0);

  useEffect(() => {
    let subscription: any;
    let lastShake = 0;
    const SHAKE_THRESHOLD = 1.5;
    const SHAKE_TIMEOUT = 1000; // 1 second cooldown between shakes

    const subscribe = async () => {
      subscription = Accelerometer.addListener(accelerometerData => {
        const { x, y, z } = accelerometerData;
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        if (acceleration > SHAKE_THRESHOLD && now - lastShake > SHAKE_TIMEOUT) {
          lastShake = now;
          handleShake();
        }
      });
    };

    subscribe();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [recipes]);

  const handleShake = () => {
    if (isShaking) return;

    setIsShaking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate shake effect
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Randomize recipe
    const randomIndex = Math.floor(Math.random() * recipes.length);
    setDisplayedRecipes([recipes[randomIndex]]);

    // Reset after 3 seconds
    setTimeout(() => {
      setDisplayedRecipes(recipes);
      setIsShaking(false);
    }, 3000);
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <Animated.View
      style={[
        styles.recipeCard,
        {
          transform: [{ translateX: shakeAnimation }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.recipeContent}
        onPress={() => onRecipePress(item)}
      >
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          {item.recipe_desc && (
            <Text style={styles.recipeDescription} numberOfLines={2}>
              {item.recipe_desc}
            </Text>
          )}
          {item.category && (
            <View style={styles.categoryContainer}>
              <Ionicons name="restaurant-outline" size={16} color="#A5B68D" />
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={24} color="#A5B68D" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.testButton}
        onPress={handleShake}
        disabled={isShaking}
      >
        <Ionicons name="shuffle" size={20} color="#fff" />
        <Text style={styles.testButtonText}>Test Random Recipe</Text>
      </TouchableOpacity>
      <FlatList
        data={displayedRecipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
      {isShaking && (
        <View style={styles.shakeIndicator}>
          <Text style={styles.shakeText}>Shake to randomize!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A5B68D',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#A5B68D',
    marginLeft: 4,
  },
  shakeIndicator: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(165, 182, 141, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shakeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
}); 