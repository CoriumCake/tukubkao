import React, { useState } from 'react'
import { Alert, StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input } from '@rneui/themed'
import { router } from 'expo-router'
import TextButton from './TextButton/TextButton'
export default function Auth() {
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

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  return (
    <View style={styles.container}>
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
        <Button title="Log In" disabled={loading} onPress={() => signInWithEmail()} />
      </View>
      <View style={styles.verticallySpaced}>
        <TextButton text="Forgot Password?" onClick={("")} disabled={loading} />
        <TextButton isBold={true} content= "Don't have an account?" text="SignUp" onClick={signUpWithEmail} disabled={loading} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
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
  }
})