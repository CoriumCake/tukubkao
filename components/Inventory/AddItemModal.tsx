import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal as RNModal,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { decode } from 'base64-arraybuffer';


interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('vegetables');
  const [quantity, setQuantity] = useState('');
  const [mfgDate, setMfgDate] = useState<Date | null>(null);
  const [expDate, setExpDate] = useState<Date | null>(null);
  const [showMfgPicker, setShowMfgPicker] = useState(false);
  const [showExpPicker, setShowExpPicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  const pickImage = async (source: 'camera' | 'gallery') => {
    setPickerModalVisible(false);
    let result;
    try {
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          quality: 0.5,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.5,
          base64: true,
        });
      }
      console.log('ImagePicker result:', result);
      if (!result.canceled && result.assets[0].base64) {
        setImage(result.assets[0].uri);
        await uploadImage(result.assets[0].base64);
      } else {
        console.log('No image selected or no base64 data.');
      }
    } catch (err) {
      console.error('Error during image picking:', err);
    }
  };

  const handleAvatarPress = () => {
    setPickerModalVisible(true);
  };

  const uploadImage = async (base64Image: string) => {
    try {
      console.log('Starting uploadImage...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session);
      if (!session?.user) {
        throw new Error('No user session');
      }
      const fileExt = 'jpg';
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      const contentType = 'image/jpeg';

      console.log('Uploading to Supabase Storage:', fileName);
      const { data, error } = await supabase.storage
        .from('ingredient-images')
        .upload(fileName, decode(base64Image), {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw error;
      }
      console.log('Upload data:', data);

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('ingredient-images')
        .getPublicUrl(fileName);

      console.log('Public URL data:', publicUrlData);
      setImage(publicUrlData.publicUrl);
    } catch (err) {
      console.error('Error in uploadImage:', err);
    }
  };

  const handleSubmit = async () => {
    if (!name || !quantity || !mfgDate || !expDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session at submit:', session);
      if (!session?.user) {
        throw new Error('No user session');
      }

      let imageUrl = image;
      console.log('Image URL to submit:', imageUrl);

      console.log('Inserting ingredient:', {
        name,
        category,
        user_id: session.user.id,
        quantity: parseInt(quantity),
        mfg: mfgDate.toISOString().split('T')[0],
        exp: expDate.toISOString().split('T')[0],
        image_url: imageUrl,
      });

      const { error } = await supabase.from('ingredients').insert([
        {
          name,
          category,
          user_id: session.user.id,
          quantity: parseInt(quantity),
          mfg: mfgDate.toISOString().split('T')[0],
          exp: expDate.toISOString().split('T')[0],
          image_url: imageUrl,
        },
      ]);

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      Alert.alert('Success', 'Ingredient added successfully!');
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error adding ingredient:', error);
      Alert.alert('Error', error.message || 'Failed to add ingredient');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('vegetables');
    setQuantity('');
    setMfgDate(null);
    setExpDate(null);
    setImage(null);
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
          <View style={styles.header}>
            <Text style={styles.title}>Add New Ingredient</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.avatarContainer} onPress={handleAvatarPress}>
            {image ? (
              <>
                <Image source={{ uri: image }} style={styles.avatarImage} />
                <TouchableOpacity
                  style={styles.cancelImageButton}
                  onPress={() => setImage(null)}
                >
                  <Ionicons name="close-circle" size={22} color="#ff4444" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera" size={36} color="#aaa" />
                <Text style={styles.avatarText}>Add Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <RNModal
            visible={pickerModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setPickerModalVisible(false)}
          >
            <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setPickerModalVisible(false)}>
              <View style={styles.pickerModal}>
                <TouchableOpacity style={styles.pickerOption} onPress={() => pickImage('camera')}>
                  <Ionicons name="camera" size={24} color="#007bff" />
                  <Text style={styles.pickerOptionText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.pickerOption} onPress={() => pickImage('gallery')}>
                  <Ionicons name="image" size={24} color="#007bff" />
                  <Text style={styles.pickerOptionText}>Choose from Gallery</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </RNModal>

          <ScrollView style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter ingredient name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={setCategory}
                  style={styles.picker}
                >
                  <Picker.Item label="Vegetables" value="vegetables" />
                  <Picker.Item label="Fruits" value="fruits" />
                  <Picker.Item label="Meat" value="meat" />
                  <Picker.Item label="Dairy" value="dairy" />
                  <Picker.Item label="Grains" value="grains" />
                  <Picker.Item label="Spices" value="spices" />
                  <Picker.Item label="Others" value="others" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Enter quantity"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Manufacturing Date *</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowMfgPicker(true)}>
                <Text style={{ color: mfgDate ? '#333' : '#aaa' }}>
                  {mfgDate ? mfgDate.toISOString().split('T')[0] : 'Select manufacturing date'}
                </Text>
              </TouchableOpacity>
              {showMfgPicker && (
                <DateTimePicker
                  value={mfgDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowMfgPicker(false);
                    if (date) setMfgDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expiration Date *</Text>
              <TouchableOpacity style={styles.input} onPress={() => setShowExpPicker(true)}>
                <Text style={{ color: expDate ? '#333' : '#aaa' }}>
                  {expDate ? expDate.toISOString().split('T')[0] : 'Select expiration date'}
                </Text>
              </TouchableOpacity>
              {showExpPicker && (
                <DateTimePicker
                  value={expDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowExpPicker(false);
                    if (date) setExpDate(date);
                  }}
                />
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Add Ingredient</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    minHeight: 400,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  form: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  inputGroup: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    width: '100%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#eee',
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
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
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: 250,
    alignItems: 'center',
    elevation: 5,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#007bff',
    marginLeft: 12,
  },
  cancelImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 12,
    zIndex: 2,
  },
}); 