import { View, Text, Image, FlatList, ScrollView, StyleSheet, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native';
import PostCard from '@/components/PostCard/PostCard';
import SearchBar from '@/components/SearchBar/SearchBar';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<Array<{ id: string; username: string; image: string; caption: string }>>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          image_url,
          user_id,
          profiles (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      console.log('Raw posts data:', JSON.stringify(postsData, null, 2));

      const formattedPosts = postsData.map(post => {
        let username = 'Unknown User';
        if (post.profiles) {
          if (Array.isArray(post.profiles)) {
            username = post.profiles[0]?.username || 'Unknown User';
          } else if (typeof post.profiles === 'object' && 'username' in post.profiles) {
            username = (post.profiles as { username?: string }).username || 'Unknown User';
          }
        }
        return {
          id: post.id,
          caption: post.content,
          image: post.image_url,
          username
        };
      });

      console.log('Formatted posts:', formattedPosts);
      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts(); // Refresh posts when there are changes
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshing={loading}
        onRefresh={fetchPosts}
        ListHeaderComponent={
          <View style={styles.searchBarContainer}>
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder="search..." />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubText}>Be the first to share something!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PostCard 
            id={item.id}
            username={item.username} 
            image={item.image} 
            caption={item.caption} 
          />
        )}
      />
      {/* Plus Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/(tabs)/(home)/create')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    backgroundColor: '#F8F2E6',
  },
  content: {
    padding: 16,
  },
  searchBarContainer: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    backgroundColor: '#A5B68D',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
});