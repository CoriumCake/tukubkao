import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
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

interface IngredientCardProps {
  item: Ingredient;
  isSelected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({
  item,
  isSelected,
  onPress,
  onLongPress,
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.ingredientCard,
        isSelected && styles.selectedIngredientCard
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
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
          <Text style={styles.ingredientDesc} numberOfLines={2}>
            {item.category} • Qty: {item.quantity} • Exp: {new Date(item.exp).toLocaleDateString()}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.selectionIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="#A5B68D" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  selectedIngredientCard: {
    borderColor: '#A5B68D',
    borderWidth: 2,
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
  ingredientDesc: {
    fontSize: 14,
    color: '#495057',
  },
  selectionIndicator: {
    marginLeft: 8,
  },
}); 