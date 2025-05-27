import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function PostDetail() {
  const { id, username, image, caption } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // Convert image string to proper ImageSourcePropType
  const imageSource: ImageSourcePropType = typeof image === 'string' 
    ? { uri: image }
    : require('@/assets/images/Icon_User.png'); // Fallback image

  // Check if post is already saved
  useEffect(() => {
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
    checkSaved();
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <TouchableOpacity onPress={handleToggleSave} disabled={loading} style={{ marginLeft: 'auto' }}>
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? '#007AFF' : '#000'}
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.postContainer}>
          <Text style={styles.username}>{username}</Text>
          <View style={styles.imageContainer}>
            <Image 
              source={imageSource}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.caption}>{caption}</Text>
          
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
}); 