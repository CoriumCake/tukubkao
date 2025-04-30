import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { StyleSheet, View, Alert, Text, Image } from 'react-native'
import { Button } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { router, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Account() {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [postsCount, setPostsCount] = useState(0)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter();

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
        .select(`username, firstname, lastname, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setFirstname(data.firstname)
        setLastname(data.lastname)
        setAvatarUrl(data.avatar_url)
      }

      // Get follower and post counts
      const { count: postCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('user_id', session?.user.id);
      setPostsCount(postCount || 0);

      const { count: followers } = await supabase
        .from('followers')
        .select('*', { count: 'exact' })
        .eq('user_id', session?.user.id);
      setFollowersCount(followers || 0);

      const { count: following } = await supabase
        .from('following')
        .select('*', { count: 'exact' })
        .eq('user_id', session?.user.id);
      setFollowingCount(following || 0);

    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Profile Image */}
        <Image
          source={{ uri: avatarUrl || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <Text style={styles.username}>{username}</Text>
      </View>

      <Text style={styles.name}>{firstname} {lastname}</Text>

      <View style={styles.statsContainer}>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#000000',
  },
  name: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#000000',
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
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
  actionButtons: {
    marginTop: 30,
  },
  updateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
  },
  signOutButton: {
    borderColor: '#FF3B30',
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
