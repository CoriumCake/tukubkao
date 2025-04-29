import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, View, Text } from 'react-native'
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import TextButton from '@/components/TextButton/TextButton'
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton'
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import { Input } from '@rneui/themed'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [userInfo, setUserInfo] = useState<any>()

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

  const configureGoogleSignIn = () => {
    GoogleSignin.configure({
      webClientId: "973460455176-7davn8p090bplcn4d17iohidfmnelb3o.apps.googleusercontent.com",
      // androidClientId: "973460455176-g4blh130f8kl9r46ocnmkcjkgg1828an.apps.googleusercontent.com",
      iosClientId: "973460455176-ntpvi36ac6sllvojas7ldgq93lepj96r.apps.googleusercontent.com",
    })
  }

  useEffect(() => {
    configureGoogleSignIn()
  }, [])

  const signInWithGoogle = async () => {
    console.log("signInWithGoogle")

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setUserInfo(userInfo);
    } catch (e: any) {
      setError(e);
    }
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

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <PrimaryButton text="Log In" onClick={signInWithEmail} disabled={loading} />
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.divider} />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signInWithGoogle}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <TextButton
          content=""
          text="Forgot Password?"
          onClick={() => router.push('/(auth)/forgot')}
          disabled={loading}
        />
        <TextButton
          isBold={true}
          content="Don't have an account?"
          text="SignUp"
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#CCCCCC',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666666',
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
})
