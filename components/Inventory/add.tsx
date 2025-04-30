import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform, Image } from 'react-native';
import { addIngredient } from './getIngredients';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';

interface IngredientForm {
  name: string;
  category: string;
  quantity: string;
  mfg: Date;
  exp: Date;
  image_url: string;
}

export default function AddIngredientForm() {
  const [form, setForm] = useState<IngredientForm>({
    name: '',
    category: '',
    quantity: '',
    mfg: new Date(),
    exp: new Date(),
    image_url: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExpDatePicker, setShowExpDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        setSelectedImage(result.assets[0].uri);
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
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const contentType = 'image/jpeg';

      console.log('Starting image upload...');
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

      console.log('Upload successful, getting public URL...');
      const { data: { publicUrl } } = supabase.storage
        .from('ingredient-images')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);
      setForm({ ...form, image_url: publicUrl });
      Alert.alert('Success', 'Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to upload image';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    
    // Validate form
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.category.trim()) {
      setError('Category is required');
      return;
    }
    if (!form.quantity.trim()) {
      setError('Quantity is required');
      return;
    }
    if (parseInt(form.quantity) <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (form.exp < form.mfg) {
      setError('Expiration date must be after manufacturing date');
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting form:', {
        ...form,
        quantity: parseInt(form.quantity),
        mfg: form.mfg.toISOString(),
        exp: form.exp.toISOString(),
      });

      const result = await addIngredient({
        name: form.name.trim(),
        category: form.category.trim(),
        quantity: parseInt(form.quantity),
        mfg: form.mfg.toISOString(),
        exp: form.exp.toISOString(),
        image_url: form.image_url.trim(),
      });
      
      console.log('Successfully added ingredient:', result);
      Alert.alert('Success', 'Ingredient added successfully');
      
      // Reset form
      setForm({
        name: '',
        category: '',
        quantity: '',
        mfg: new Date(),
        exp: new Date(),
        image_url: '',
      });
      setSelectedImage(null);
    } catch (error) {
      console.error('Error adding ingredient:', error);
      const errorMessage = error instanceof Error 
        ? `${error.message}\n\nStack: ${error.stack}`
        : 'An unknown error occurred';
      setError(errorMessage);
      Alert.alert(
        'Error',
        'Failed to add ingredient. Please check the console for more details.',
        [
          {
            text: 'Show Details',
            onPress: () => Alert.alert('Error Details', errorMessage),
          },
          { text: 'OK' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setForm({ ...form, mfg: selectedDate });
    }
  };

  const onExpDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowExpDatePicker(false);
    }
    
    if (selectedDate) {
      setForm({ ...form, exp: selectedDate });
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const showExpDatepicker = () => {
    setShowExpDatePicker(true);
  };

  return (
    <ScrollView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={[styles.input, !form.name.trim() && styles.inputError]}
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
          placeholder="Enter ingredient name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Category *</Text>
        <TextInput
          style={[styles.input, !form.category.trim() && styles.inputError]}
          value={form.category}
          onChangeText={(text) => setForm({ ...form, category: text })}
          placeholder="Enter category"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Quantity *</Text>
        <TextInput
          style={[styles.input, (!form.quantity.trim() || parseInt(form.quantity) <= 0) && styles.inputError]}
          value={form.quantity}
          onChangeText={(text) => setForm({ ...form, quantity: text.replace(/[^0-9]/g, '') })}
          placeholder="Enter quantity"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Manufacturing Date *</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={showDatepicker}
          accessibilityLabel="Select manufacturing date"
        >
          <Text style={styles.dateText}>
            {form.mfg.toLocaleDateString()}
          </Text>
          <Ionicons name="calendar-outline" size={24} color="#495057" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={form.mfg}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
            style={styles.datePicker}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Expiration Date *</Text>
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={showExpDatepicker}
          accessibilityLabel="Select expiration date"
        >
          <Text style={styles.dateText}>
            {form.exp.toLocaleDateString()}
          </Text>
          <Ionicons name="calendar-outline" size={24} color="#495057" />
        </TouchableOpacity>
        {showExpDatePicker && (
          <DateTimePicker
            value={form.exp}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onExpDateChange}
            minimumDate={form.mfg}
            style={styles.datePicker}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Image</Text>
        <TouchableOpacity
          style={styles.imageUploadButton}
          onPress={pickImage}
          disabled={uploading}
        >
          <Ionicons name="image-outline" size={24} color="#495057" />
          <Text style={styles.imageUploadText}>
            {uploading ? 'Uploading...' : 'Select Image'}
          </Text>
        </TouchableOpacity>
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.imagePreview}
            />
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, (loading || uploading) && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading || uploading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Adding...' : 'Add Ingredient'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#495057',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#495057',
  },
  datePicker: {
    width: '100%',
  },
  imageUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  imageUploadText: {
    fontSize: 16,
    color: '#495057',
  },
  imagePreviewContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
});
