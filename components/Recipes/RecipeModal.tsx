import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Recipe {
  id: string; // or number, depending on your schema
  title: string;
  recipe_desc?: string;
  ingred: string[];
}

interface RecipeDetails {
  id: string; // or number
  title: string;
  recipe_desc: string;
  ingred: string[];
}

interface RecipeModalProps {
  recipe: RecipeDetails | null;
  visible: boolean;
  onClose: () => void;
  onSave: (recipe: RecipeDetails) => void;
  isSaved?: boolean;
  onDelete?: (recipe: RecipeDetails) => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({
  recipe,
  visible,
  onClose,
  onSave,
  isSaved = false,
  onDelete,
}) => {
  if (!recipe) return null;

  const renderFormattedText = (text: string, keyPrefix: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return (
          <Text key={keyPrefix + idx} style={{ fontWeight: 'bold' }}>
            {part.replace(/\*\*/g, '')}
          </Text>
        );
      } else {
        return <Text key={keyPrefix + idx}>{part}</Text>;
      }
    });
  };

  const formatRecipeDescription = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
        return (
          <Text key={index} style={styles.sectionTitle}>
            {line.replace(/\*\*/g, '')}
          </Text>
        );
      }
      if (line.trim().startsWith('•')) {
        return (
          <View key={index} style={styles.ingredientItem}>
            <Ionicons name="ellipse" size={8} color="#A5B68D" style={styles.bulletPoint} />
            <Text style={styles.ingredientText}>{line.replace(/^•\s*/, '')}</Text>
          </View>
        );
      }
      if (/^\d+\. /.test(line.trim())) {
        return (
          <Text key={index} style={styles.recipeDescription}>
            {renderFormattedText(line, `step-${index}-`)}
          </Text>
        );
      }
      return (
        <Text key={index} style={styles.recipeDescription}>
          {renderFormattedText(line, `desc-${index}-`)}
        </Text>
      );
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{recipe.title}</Text>
            <TouchableOpacity 
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.recipeSection}>
              {formatRecipeDescription(recipe.recipe_desc)}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            {isSaved ? (
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: '#e74c3c' }]}
                onPress={() => {
                  onDelete && onDelete(recipe);
                  onClose();
                }}
              >
                <Ionicons name="trash-outline" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Delete Recipe</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={() => {
                  onSave(recipe);
                  onClose();
                }}
              >
                <Ionicons name="save-outline" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Save Recipe</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    padding: 16,
  },
  recipeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 12,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bulletPoint: {
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
  },
  saveButton: {
    backgroundColor: '#A5B68D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 