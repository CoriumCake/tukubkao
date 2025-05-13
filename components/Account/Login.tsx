import React, { useState } from 'react'
import { Alert, StyleSheet, View, Text } from 'react-native'
import { supabase } from '@/lib/supabase'
import { Input } from '@rneui/themed'
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
          labelStyle={styles.labelText}
          leftIcon={{ type: 'font-awesome', name: 'envelope', color: '#000', size: 20 }}
          leftIconContainerStyle={styles.iconStyle}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          onChangeText={setEmail}
          value={email}
          placeholder="Email@address.com"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          labelStyle={styles.labelText}
          leftIcon={{ type: 'font-awesome', name: 'lock', color: '#000', size: 20 }}
          leftIconContainerStyle={styles.iconStyle}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <PrimaryButton 
          text="Log In" 
          onClick={signInWithEmail} 
          disabled={loading} 
          style={styles.button} 
        />
      </View>

      <View style={styles.verticallySpaced}>
        <TextButton
          content=""
          text="Forgot Password?"
          onClick={() => router.push('/(auth)/forgot')}
          disabled={loading}
          textStyle={styles.boldText}
        />
        <TextButton
          isBold={true}
          content="Don't have an account?"
          text={<Text style={{ fontWeight: 'normal', fontFamily: 'Ysabeau-Bold' }}>Signup</Text>}
          onClick={() => router.push('/(auth)/signup')}
          disabled={loading}
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
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 50,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Ysabeau-Bold',
    textAlign: 'center',
    marginTop: 50, 
    color: '#000000',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Ysabeau-Regular',
    textAlign: 'center',
    color: '#000000',
  },
  labelText: {
    fontFamily: 'Ysabeau-Bold',
    marginBottom: 4,
  },
  iconStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingLeft: 4,
  },
  inputText: {
    marginLeft: 4,
    fontFamily: 'Ysabeau-Regular',
  },
  boldText: {
    fontFamily: 'Ysabeau-Bold',
    fontWeight: 'bold',
  },
  button: {
    fontFamily: 'Ysabeau-Bold',
    fontWeight: 'bold',
    borderRadius: 8, 
    width: '100%', 
    alignSelf: 'center', 
  },
})

