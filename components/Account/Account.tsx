import React, { useState, useEffect, useLayoutEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { StyleSheet, View, Alert, Text, Image, FlatList, TouchableOpacity, Dimensions, TextInput } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'
import { useTranslation } from 'react-i18next'

export default function Account() {
  
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [postsCount, setPostsCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [session, setSession] = useState<Session | null>(null)
  const [selectedTab, setSelectedTab] = useState<'my' | 'saved'>('my')
  const [myPosts, setMyPosts] = useState<any[]>([])
  const [savedPosts, setSavedPosts] = useState<any[]>([])
  const screenWidth = Dimensions.get('window').width
  const [bio, setBio] = useState('');

  const router = useRouter();  // สำหรับการใช้งาน expo-router
  const navigation = useNavigation();  // สำหรับการใช้งาน React Navigation
  const { t } = useTranslation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('Session data:', data);
      setSession(data.session)
    })
  }, [])

  useEffect(() => {
    if (session) {
      console.log('Session available, getting profile...');
      getProfile()
    }
  }, [session])

  useEffect(() => {
    if (session?.user) {
      fetchMyPosts();
      fetchSavedPosts();
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          getProfile();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session]);

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F2E6' }}>
        <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>{t('please_login')}</Text>
          <Button 
            title={t('go_to_login')} 
            onPress={() => router.replace('/(auth)/login')}
            buttonStyle={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F2E6' }}>
        <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18 }}>{t('loading_profile')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!username) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F2E6' }}>
        <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>{t('profile_not_found')}</Text>
          <Button 
            title={t('go_to_login')} 
            onPress={() => router.replace('/(auth)/login')}
            buttonStyle={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')
      console.log('Fetching profile for user:', session.user.id);

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, avatar_url, c_post, c_followers, c_following, bio`)
        .eq('id', session?.user.id)
        .single()
      
      console.log('Profile data:', data);
      console.log('Profile error:', error);
      console.log('Profile status:', status);

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        let avatar = data.avatar_url;
        if (avatar && !avatar.startsWith('http')) {
          const avatarPublicUrl = await getAvatarUrl(avatar);
          console.log('Avatar public URL:', avatarPublicUrl);
          if (avatarPublicUrl) {
            avatar = avatarPublicUrl;
          }
        }
        setAvatarUrl(avatar);
        setPostsCount(data.c_post || 0)
        setFollowersCount(data.c_followers || 0)
        setFollowingCount(data.c_following || 0)
        setBio(data.bio || '')
      }
    } catch (error) {
      console.error('Error in getProfile:', error);
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function getAvatarUrl(path: string) {
    if (!path) return null;
    try {
      const { data } = supabase.storage.from('user-avatar').getPublicUrl(path);
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting avatar URL:', error);
      return null;
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/(auth)/login');
    } else {
      Alert.alert('Error signing out:', error.message);
    }
  }

  async function fetchMyPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', session?.user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setMyPosts(data);
  }

  async function fetchSavedPosts() {
    const { data, error } = await supabase
      .from('saved_posts')
      .select('post_id, posts(*)')
      .eq('user_id', session?.user.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      // Extract posts from join
      setSavedPosts(data.map((item: any) => item.posts));
    }
  }

  // Avatar picker logic
  async function handlePickAvatar() {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos.');
      return;
    }
    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // square crop
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
      const asset = result.assets[0];
      const base64 = asset.base64;
      if (!session?.user) return;
      const fileExt = 'jpg';
      const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
      const filePath = `user-avatar/${fileName}`;
      // Upload as ArrayBuffer
      const { error: uploadError } = await supabase.storage.from('user-avatar').upload(filePath, decode(base64 as string), {
        contentType: 'image/jpeg',
        upsert: true,
      });
      if (uploadError) {
        Alert.alert('Upload failed', uploadError.message);
        return;
      }
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', session.user.id);
      if (updateError) {
        Alert.alert('Profile update failed', updateError.message);
        return;
      }
      // Get public URL and update avatar
      const { data: publicUrlData } = supabase.storage.from('user-avatar').getPublicUrl(filePath);
      const publicUrl = publicUrlData?.publicUrl;
      if (publicUrl) {
        setAvatarUrl(publicUrl + `?t=${Date.now()}`);
      }
      await getProfile();
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.username}>{username}</Text>
          <Button
            icon={
              <Icon
                name="menu"
                type="feather"
                color="#000"
                size={28}
              />
            }
            type="clear"
            onPress={() => {
              router.push('/settings');
            }}
          />
        </View>
      </View>


      {/* Profile Image and Stats Container */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: avatarUrl || 'https://mosrzootwtqzcuqgczwb.supabase.co/storage/v1/object/public/user-avatar/a59b94c1-9081-4744-acbe-07175a504e9b/43073.image2.jpg' }}
          style={styles.profileImage}
        />
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{postsCount}</Text>
            <Text style={styles.statLabel}>{t('posts')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{followersCount}</Text>
            <Text style={styles.statLabel}>{t('followers')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{followingCount}</Text>
            <Text style={styles.statLabel}>{t('following')}</Text>
          </View>
        </View>
      </View>

      {/* Bio Section */}
      <View style={{ marginBottom: 10, marginLeft: 2 }}>
        <Text style={[styles.bio]} numberOfLines={3} ellipsizeMode="tail">
          {bio ? bio : t('edit_me')}
        </Text>
      </View>

      <View style={styles.actionButtons}>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#A5B68D',
          borderRadius: 8,
          paddingVertical: 14,
          alignItems: 'center',
          marginBottom: 16,
          marginHorizontal: 0,
          width: '100%',
        }}
        onPress={() => router.push('/account-details')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Tab Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab('my')}
        >
          <Ionicons
            name={selectedTab === 'my' ? 'grid' : 'grid-outline'}
            size={28}
            color={selectedTab === 'my' ? '#A5B68D' : '#666'}
          />
          {selectedTab === 'my' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab('saved')}
        >
          <Ionicons
            name={selectedTab === 'saved' ? 'bookmark' : 'bookmark-outline'}
            size={28}
            color={selectedTab === 'saved' ? '#A5B68D' : '#666'}
          />
          {selectedTab === 'saved' && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>

      {/* Grid Section */}
      <FlatList
        data={selectedTab === 'my' ? myPosts : savedPosts}
        keyExtractor={item => item.id?.toString()}
        numColumns={3}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ width: screenWidth / 3, aspectRatio: 1, padding: 2 }}
            onPress={() => {
              router.push({
                pathname: '/(tabs)/(home)/[id]',
                params: {
                  id: item.id,
                  username: username,
                  image: item.image_url || item.image || 'https://via.placeholder.com/150',
                  caption: item.caption || '',
                  isOwner: '1' // Pass as string to avoid type error
                }
              });
            }}
          >
            <Image
              source={{ uri: item.image_url || item.image || 'https://via.placeholder.com/150' }}
              style={{ width: '100%', height: '100%', borderRadius: 8, backgroundColor: '#eee' }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32, color: '#888' }}>No posts to display.</Text>}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  header: {
    marginTop: 0,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },  
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 0,
  },
  profileImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2,
    borderColor: '#A5B68D',
    marginLeft: 0,
    marginRight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '70%',
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 0,
  },
  statCount: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 13,
    color: '#666666',
  },
  bio: {
    fontSize: 15,
    textAlign: 'left',
    marginTop: 0,
    marginBottom: 10,
    color: '#666666',
    marginLeft: 2,
  },
  actionButtons: {
    marginTop: 30,
    justifyContent: 'space-between',
  },
  updateButton: {
    backgroundColor: '#A5B68D',
    borderRadius: 8,
    paddingVertical: 12,
  },
  signOutButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    width: 200,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
    borderRadius: 0,
    marginHorizontal: 0,
  },
  tabUnderline: {
    marginTop: 4,
    height: 3,
    width: 32,
    backgroundColor: '#A5B68D',
    borderRadius: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
  },
})
