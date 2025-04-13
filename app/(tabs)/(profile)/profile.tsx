import { Link, useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { Button } from '@rneui/themed';
export default function ProfileScreen() {

  const [session, setSession] = useState<Session | null>(null)
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/(auth)/login');
    } else {
      console.error('Error signing out:', error);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <View>
          <Text>Hello {session?.user?.email}</Text>
            <Button title="Sign Out" onPress={handleSignOut} />
        </View>     
      </View>
    </SafeAreaView>
  );
}
