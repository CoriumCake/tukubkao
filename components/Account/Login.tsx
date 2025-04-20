import React, { useState } from 'react'
import { Alert, StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import { supabase } from '@/lib/supabase'
import { Input } from '@rneui/themed'
import { router } from 'expo-router'
import TextButton from '@/components/TextButton/TextButton'
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton'
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    else router.replace('/(tabs)/(home)')
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(auth)/splash')}>
        <Ionicons name="arrow-back" size={28} color="#000" style={{ marginTop: -20 }} />
      </TouchableOpacity>

      {/* Login Form */}
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Log in to continue</Text>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="  Email@address.com"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="    Password"
          autoCapitalize="none"
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <PrimaryButton text="Log In" onClick={signInWithEmail} disabled={loading} />
        <TextButton content="" text="Forgot Password?" onClick={() => router.push('/(auth)/forgot')} disabled={loading} />
      </View>
    </View>

          {/* Links to other pages */}
          <View style={styles.bottomLinks}>
            <TextButton isBold={true} content="Don't have an account?" text="SignUp" onClick={() => router.push('/(auth)/signup')} disabled={loading} />
          </View>
        </View>
      )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F2E6',
    marginTop: 40,
    padding: 12,
    justifyContent: 'space-between',
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  title: {
    fontSize: 60,
    fontFamily: 'YsabeauOffice', 
    textAlign: 'center',
    marginTop: 50,
    color: '#000000',
  },
  subtitle: {
    fontSize: 25,
    fontFamily: 'YsabeauOffice', 
    textAlign: 'center',
    color: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
  },
  bold: {
    fontFamily: 'YsabeauOffice',
    fontWeight: 'bold',
    fontSize: 20,
  },
  bottomLinks: {
    marginBottom: 20, 
  },
  contentWrapper: {
    flexGrow: 1,
  },
})
