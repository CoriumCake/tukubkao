import { useState, useEffect, useLayoutEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { StyleSheet, View, Alert, Text, Image } from 'react-native'
import { Button, Icon } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Account() {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [postsCount, setPostsCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [session, setSession] = useState<Session | null>(null)

  const router = useRouter();  // สำหรับการใช้งาน expo-router
  const navigation = useNavigation();  // สำหรับการใช้งาน React Navigation

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  useEffect(() => {
    if (session) getProfile()
  }, [session])
 

  if (!session) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F2E6' }}>
        <View style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>Please log in to view your profile</Text>
          <Button 
            title="Go to Login" 
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

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, full_name, avatar_url, c_post, c_followers, c_following`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setFullName(data.full_name)
        setAvatarUrl(data.avatar_url)
        setPostsCount(data.c_post || 0)
        setFollowersCount(data.c_followers || 0)
        setFollowingCount(data.c_following || 0)
        const avatarPublicUrl = await getAvatarUrl(data.avatar_url)
        setAvatarUrl(avatarPublicUrl)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function getAvatarUrl(path: string) {
    if (!path) return null;
    // Replace 'avatars' with your actual bucket name if different
    const { data, error } = supabase.storage.from('avatars').getPublicUrl(path);
    if (error) {
      console.error('Error getting avatar URL:', error.message);
      return null;
    }
    return data.publicUrl;
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/(auth)/login');
    } else {
      Alert.alert('Error signing out:', error.message);
    }
  }

  return (
    <View style={styles.container}>
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
          source={{ uri: avatarUrl || 'https://mosrzootwtqzcuqgczwb.supabase.co/storage/v1/object/public/avatars/a59b94c1-9081-4744-acbe-07175a504e9b/43073.image2.jpg' }}
          style={styles.profileImage}
        />
        <View style={styles.statsContainer}>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{postsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statCount}>{followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      <Text style={styles.bio}>This is your bio, feel free to edit it!</Text>

      <View style={styles.actionButtons}>
        <Button 
          title={loading ? 'Loading ...' : 'Update Profile'}
          disabled={loading}
          buttonStyle={styles.updateButton}
        />
        <Button 
          title="Sign Out" 
          onPress={handleSignOut}
          buttonStyle={styles.signOutButton}
          type="outline"
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F2E6',
    padding: 16,
  },
  header: {
    marginTop: 10, 
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },  
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 3,
    borderColor: '#A5B68D',
    marginLeft: '3%',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    marginBottom: 20, 
    width: '65%', 
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    color: '#000000',
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 15, 
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#666666',
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
})
