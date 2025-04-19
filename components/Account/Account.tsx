import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { StyleSheet, View, Alert, Text } from 'react-native'
import { Button, Input } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { router, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Account() {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  
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
            buttonStyle={{ backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 12 }}
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
        .select(`username, website, avatar_url`)
        .eq('id', session?.user.id)
        .single()
      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string
    website: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session?.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
      Alert.alert('Profile updated successfully!')
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
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your account settings</Text>
      
      <View style={styles.formContainer}>
        <View style={styles.verticallySpaced}>
          <Input 
            label="Email" 
            value={session?.user?.email} 
            disabled 
            leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Input 
            label="Username" 
            value={username || ''} 
            onChangeText={(text) => setUsername(text)}
            leftIcon={{ type: 'font-awesome', name: 'user' }}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Input 
            label="Website" 
            value={website || ''} 
            onChangeText={(text) => setWebsite(text)}
            leftIcon={{ type: 'font-awesome', name: 'globe' }}
          />
        </View>

        <View style={[styles.verticallySpaced, styles.mt20]}>
          <Button
            title={loading ? 'Loading ...' : 'Update Profile'}
            onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
            disabled={loading}
            buttonStyle={styles.updateButton}
          />
        </View>

        <View style={styles.verticallySpaced}>
          <Button 
            title="Sign Out" 
            onPress={handleSignOut}
            buttonStyle={styles.signOutButton}
            type="outline"
          />
        </View>
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
  formContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: '#000000',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    color: '#666666',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
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
  },
})