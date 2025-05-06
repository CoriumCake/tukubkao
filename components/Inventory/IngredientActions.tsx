import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateIngredient, deleteIngredient } from './getIngredients';

interface IngredientActionsProps {
  ingredient: {
    name: string;
    category: string;
    quantity: number;
    mfg: string;
    exp: string;
    image_url: string;
  };
  onClose: () => void;
  visible: boolean;
  onSuccess?: () => void;
}

export default function IngredientActions({ ingredient, onClose, visible, onSuccess }: IngredientActionsProps) {
  const [editedIngredient, setEditedIngredient] = useState(ingredient);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      await updateIngredient(ingredient.name, editedIngredient);
      onSuccess?.();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update ingredient');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Ingredient',
      'Are you sure you want to delete this ingredient?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteIngredient(ingredient.name);
              onSuccess?.();
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete ingredient');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Edit Ingredient</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={editedIngredient.name}
              onChangeText={(text) => setEditedIngredient({ ...editedIngredient, name: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={editedIngredient.category}
              onChangeText={(text) => setEditedIngredient({ ...editedIngredient, category: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={editedIngredient.quantity.toString()}
              onChangeText={(text) => setEditedIngredient({ ...editedIngredient, quantity: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Manufacturing Date</Text>
            <TextInput
              style={styles.input}
              value={editedIngredient.mfg}
              onChangeText={(text) => setEditedIngredient({ ...editedIngredient, mfg: text })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Expiration Date</Text>
            <TextInput
              style={styles.input}
              value={editedIngredient.exp}
              onChangeText={(text) => setEditedIngredient({ ...editedIngredient, exp: text })}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.updateButton]}
              onPress={handleUpdate}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  updateButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 