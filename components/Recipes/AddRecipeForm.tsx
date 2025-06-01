import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

interface AddRecipeFormProps {
  onSuccess?: () => void;
}

export default function AddRecipeForm({ onSuccess }: AddRecipeFormProps) {
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
        setImage(result.assets[0].uri);
        await uploadImage(result.assets[0].base64);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadImage = async (base64Image: string) => {
    try {
      setUploading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No user session');
      }
      const fileExt = 'jpg';
      const fileName = `${session.user.id}/recipe_${Date.now()}.${fileExt}`;
      const contentType = 'image/jpeg';
      const { data, error } = await supabase.storage
        .from('ingredient-images')
        .upload(fileName, decode(base64Image), {
          contentType,
          upsert: true,
        });
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      const { data: publicUrlData } = supabase.storage
        .from('ingredient-images')
        .getPublicUrl(fileName);
      setImageUrl(publicUrlData.publicUrl);
      Alert.alert('Success', 'Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !ingredients.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No user session');
      }
      const ingredArr = ingredients
        .split(/,|\n/)
        .map(i => i.trim())
        .filter(i => i.length > 0);
      const { error } = await supabase.from('recipes').insert([
        {
          title: title.trim(),
          recipe_desc: description.trim(),
          ingred: ingredArr,
          image_url: imageUrl,
          user_id: session.user.id,
        },
      ]);
      if (error) throw error;
      Alert.alert('Success', 'Recipe added successfully!');
      setTitle('');
      setIngredients('');
      setDescription('');
      setImage(null);
      setImageUrl('');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error adding recipe:', error);
      Alert.alert('Error', error.message || 'Failed to add recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Recipe Photo</Text>
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.imagePlaceholder}>Pick an image</Text>
        )}
        {uploading && <ActivityIndicator style={styles.imageUploading} />}
      </TouchableOpacity>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter recipe title"
      />
      <Text style={styles.label}>Ingredients (comma or new line separated)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={ingredients}
        onChangeText={setIngredients}
        placeholder="e.g. chicken, rice, egg"
        multiline
      />
      <Text style={styles.label}>Recipe Description</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe how to make the recipe..."
        multiline
      />
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Add Recipe</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    marginBottom: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    color: '#aaa',
    fontSize: 16,
  },
  imageUploading: {
    position: 'absolute',
    top: 48,
    left: 48,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 