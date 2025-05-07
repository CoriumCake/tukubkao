import React, { useState } from 'react'
import { Alert, StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import { supabase } from '@/lib/supabase'
import { Button, Input } from '@rneui/themed'
import { router } from 'expo-router'
import TextButton from '@/components/TextButton/TextButton'
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton'

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
    else router.replace('/(tabs)' as any);
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Log in to continue</Text>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <PrimaryButton text="Log In" onClick={signInWithEmail} disabled={loading} />
      </View>
      <View style={styles.verticallySpaced}>
        <TextButton content="" text="Forgot Password?" onClick={() => router.push('/(auth)/forgot')} disabled={loading} />
        <TextButton isBold={true} content= "Don't have an account?" text="SignUp" onClick={() => router.push('/(auth)/signup')} disabled={loading} />
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
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 5,
  },
  accountText: {
    fontSize: 16,
  },
  signUpText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 36,   
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
    color: '#000000',
  },
  subtitle: {
    fontSize: 20,   
    textAlign: 'center',
    marginTop: 0,
    color: '#000000',
  },
})