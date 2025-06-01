import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreatePost() {
  const router = useRouter();
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newCaption, setNewCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Please grant camera roll permissions to upload images');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 1,
        base64: true,
      });
      if (!result.canceled) {
        setNewImage(result.assets[0].uri);
        setUploadProgress(0);
        setUploadStatus('');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    }
  };

  const handleAddPost = async () => {
    if (!newImage || !newCaption) return;
    setLoading(true);
    setUploadProgress(0);
    setUploadStatus('Preparing upload...');

    // Get authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      alert('You must be logged in to post.');
      setLoading(false);
      return;
    }
    const userId = session.user.id;

    let imageUrl = '';
    try {
      // Upload image to Supabase Storage
      setUploadStatus('Processing image...');
      const response = await fetch(newImage);
      const blob = await response.blob();
      
      // Validate file type
      if (!blob.type.startsWith('image/')) {
        throw new Error('Invalid file type. Please upload an image.');
      }

      // Get file extension from mime type
      const fileExt = blob.type.split('/')[1] || 'jpg';
      const fileName = `${userId}_${Date.now()}.${fileExt}`;

      // Convert blob to base64
      setUploadStatus('Converting image...');
      setUploadProgress(20);
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(blob);
      const base64Data = await base64Promise;

      setUploadStatus('Uploading to server...');
      setUploadProgress(40);
      console.log('Attempting to upload to post-images bucket...');
      const { data: storageData, error: storageError } = await supabase.storage
        .from('post-images')
        .upload(fileName, decode(base64Data), {
          contentType: blob.type,
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error('Storage Error Details:', {
          message: storageError.message,
          name: storageError.name,
          error: storageError
        });
        throw new Error(`Upload failed: ${storageError.message}`);
      }

      setUploadProgress(80);
      setUploadStatus('Getting public URL...');
      console.log('Upload successful, getting public URL...');
      const { data: urlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(fileName);
      
      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }
      
      imageUrl = urlData.publicUrl;
      setUploadProgress(90);
      setUploadStatus('Creating post...');

      // Insert post into database
      const { data, error } = await supabase
        .from('posts')
        .insert([
          { user_id: userId, content: newCaption, image_url: imageUrl }
        ]);
      
      if (error) {
        throw error;
      }

      setUploadProgress(100);
      setUploadStatus('Post created successfully!');
      setTimeout(() => {
        setLoading(false);
        router.back(); // Return to home page after successful post
      }, 1000);
    } catch (err) {
      console.error('Upload error:', err);
      setLoading(false);
      setUploadProgress(0);
      setUploadStatus('');
      alert(err instanceof Error ? err.message : 'Image upload failed');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handleAddPost}
          disabled={loading || !newImage || !newCaption}
          style={[styles.postButton, (!newImage || !newCaption) && styles.postButtonDisabled]}
        >
          <Text style={[styles.postButtonText, (!newImage || !newCaption) && styles.postButtonTextDisabled]}>
            Post
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {newImage ? (
            <Image source={{ uri: newImage }} style={styles.selectedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={40} color="#aaa" />
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.captionInput}
          value={newCaption}
          onChangeText={setNewCaption}
          placeholder="Write a caption..."
          multiline
          maxLength={500}
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#A5B68D" />
            <Text style={styles.uploadStatus}>{uploadStatus}</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postButton: {
    backgroundColor: '#A5B68D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postButtonTextDisabled: {
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imagePicker: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#666',
  },
  captionInput: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: 'top',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  uploadStatus: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#A5B68D',
  },
  progressText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
}); 