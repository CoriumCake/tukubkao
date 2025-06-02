import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ImageSourcePropType, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

export default function PostDetail() {
  const { id, username: paramUsername, image: paramImage, caption: paramCaption, isOwner } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editCaption, setEditCaption] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editImage, setEditImage] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      if (data) setPost(data);
    };
    fetchPost();
  }, [id]);

  const imageSource: ImageSourcePropType = post?.image_url
    ? { uri: post.image_url }
    : (typeof paramImage === 'string' ? { uri: paramImage } : require('@/assets/images/Icon_User.png'));

  // Check if post is already saved
  const checkSaved = async () => {
    if (!session?.user?.id || !id) return;
    const { data, error } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('post_id', id)
      .single();
    setIsSaved(!!data);
  };

  useEffect(() => {
    checkSaved();
  }, [session, id]);

  // Real-time subscription for bookmark status
  useEffect(() => {
    if (!session?.user?.id || !id) return;
    const channel = supabase
      .channel('saved_post_detail')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'saved_posts',
          filter: `user_id=eq.${session.user.id},post_id=eq.${id}`,
        },
        () => {
          checkSaved();
        }
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [session, id]);

  // Save/Unsave post
  const handleToggleSave = async () => {
    if (!session?.user?.id || !id) return;
    setLoading(true);
    if (isSaved) {
      // Unsave
      await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', session.user.id)
        .eq('post_id', id);
      setIsSaved(false);
    } else {
      // Save
      await supabase
        .from('saved_posts')
        .insert([{ user_id: session.user.id, post_id: id }]);
      setIsSaved(true);
    }
    setLoading(false);
  };

  // Handler for deleting post
  const handleDelete = async () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await supabase.from('posts').delete().eq('id', id);
        router.back();
      }}
    ]);
  };

  // Handler for editing post (open modal)
  const handleEdit = () => {
    setEditCaption(post?.caption || '');
    setEditContent(post?.content || '');
    setEditImage(post?.image_url || null);
    setEditModalVisible(true);
  };

  // Handler for picking new image
  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setEditImage(result.assets[0].uri);
    }
  };

  // Handler for saving edits
  const handleSaveEdit = async () => {
    setEditLoading(true);
    let image_url = editImage;
    // Optionally upload new image if changed and is local
    if (editImage && editImage !== post?.image_url && editImage.startsWith('file')) {
      // Upload to Supabase Storage (implement as needed)
      // For now, just keep the local URI
    }
    const { error } = await supabase
      .from('posts')
      .update({
        content: editContent,
        image_url: image_url,
      })
      .eq('id', id);
    setEditLoading(false);
    if (!error) {
      setEditModalVisible(false);
      setPost({ ...post, content: editContent, image_url });
      Alert.alert('Success', 'Post updated!');
    } else {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={{ flexDirection: 'row', marginLeft: 'auto', alignItems: 'center' }}>
          {isOwner === '1' && (
            <>
              <TouchableOpacity onPress={handleEdit} style={{ marginLeft: 12 }}>
                <Ionicons name="create-outline" size={24} color="#A5B68D" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={{ marginLeft: 12 }}>
                <Ionicons name="trash-outline" size={24} color="#E22019" />
              </TouchableOpacity>
            </>
          )}
          {isOwner === '1' ? null : (
            <TouchableOpacity onPress={handleToggleSave} disabled={loading} style={{ marginLeft: 12 }}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={isSaved ? '#4CAF50' : '#000'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.postContainer}>
          <Text style={styles.username}>{post?.username || paramUsername}</Text>
          <View style={styles.imageContainer}>
            <Image 
              source={imageSource}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          {/* Remove caption display */}
          {/* <Text style={styles.caption}>{post?.caption || paramCaption}</Text> */}
          {post?.content && (
            <Text style={styles.postContent}>{post.content}</Text>
          )}
          
          {/* Additional post details can be added here */}
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Details</Text>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.detailText}>Posted 2 hours ago</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="heart-outline" size={20} color="#666" />
              <Text style={styles.detailText}>24 likes</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="chatbubble-outline" size={20} color="#666" />
              <Text style={styles.detailText}>5 comments</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Post Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, width: '90%', padding: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Edit Post</Text>
            <TouchableOpacity onPress={handlePickImage} style={{ alignSelf: 'center', marginBottom: 16 }}>
              {editImage ? (
                <Image source={{ uri: editImage }} style={{ width: 120, height: 120, borderRadius: 8 }} />
              ) : (
                <View style={{ width: 120, height: 120, borderRadius: 8, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="image-outline" size={32} color="#aaa" />
                  <Text style={{ color: '#aaa' }}>Add Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {/* Remove caption TextInput */}
            {/* <TextInput
              style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, marginBottom: 12 }}
              value={editCaption}
              onChangeText={setEditCaption}
              placeholder="Caption"
            /> */}
            <TextInput
              style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 8, marginBottom: 12, height: 80 }}
              value={editContent}
              onChangeText={setEditContent}
              placeholder="Content"
              multiline
            />
            <TouchableOpacity
              style={{ backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 }}
              onPress={handleSaveEdit}
              disabled={editLoading}
            >
              {editLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{ position: 'absolute', top: 12, right: 12 }}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  postContainer: {
    padding: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  caption: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  postContent: {
    fontSize: 15,
    color: '#444',
    marginTop: 8,
    marginBottom: 16,
  },
}); 