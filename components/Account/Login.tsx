import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Input } from '@rneui/themed';
import { router } from 'expo-router';
import TextButton from '@/components/TextButton/TextButton';
import PrimaryButton from '@/components/PrimaryButton/PrimaryButton';
import Fonts from '@/constants/Fonts';
import Colors from '@/constants/Colors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    else router.replace('/(tabs)' as any);
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {/* Title Section */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subTitle}>Sign in to continue</Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Your Email or Username"
          autoCapitalize="none"
          inputStyle={{ fontFamily: Fonts.yR, paddingLeft: 8 }}
          labelStyle={{ fontFamily: Fonts.yR, marginBottom: 6 }}
          containerStyle={{ marginBottom: 20, paddingHorizontal: 0 }}
          inputContainerStyle={{ borderBottomWidth: 1, borderBottomColor: Colors.text }}
        />
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Your Password"
          autoCapitalize="none"
          inputStyle={{ fontFamily: Fonts.yR, paddingLeft: 8 }}
          labelStyle={{ fontFamily: Fonts.yR, marginBottom: 6 }}
          containerStyle={{ marginBottom: 10, paddingHorizontal: 0 }}
          inputContainerStyle={{ borderBottomWidth: 1, borderBottomColor: Colors.text }}
        />
      </View>


      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <PrimaryButton text="Log In" onClick={signInWithEmail} disabled={loading} />
      </View>

      {/* TextButton Section */}
      <View style={styles.textButtonContainer}>
        <TextButton
          content=""
          text="Forgot Password?"
          onClick={() => router.push('/(auth)/forgot')}
          disabled={loading}
          textStyle={{ fontFamily: Fonts.yR }}
        />
      </View>
      <View style={styles.textButtonContainerBottom}>
        <TextButton
          content="Don't have an account?"
          text="SignUp"
          onClick={() => router.push('/(auth)/signup')}
          disabled={loading}
          isBold
          textStyle={{ fontFamily: Fonts.yB }}
          contentStyle={{ fontFamily: Fonts.yR }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, // ลดจากเดิมถ้ามี
    marginTop: -100,
  },
  title: {
    fontSize: 64,
    fontFamily: Fonts.yS,
    color: Colors.text,
  },
  subTitle: {
    fontSize: 24,
    fontFamily: Fonts.yR, 
    color: Colors.text,
  },
  inputContainer: {
    width: '80%',
    marginTop: 20,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 10,
  },
  textButtonContainer: {
    marginTop: 10,
  },
  textButtonContainerBottom: {
    marginTop: -5,
  },
});