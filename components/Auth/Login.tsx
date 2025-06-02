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
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subTitle}>Sign in to continue</Text>
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Input
          label="Email"
          leftIcon={{ type: "font-awesome", name: "envelope" }}
          onChangeText={setEmail}
          value={email}
          placeholder="Your Email"
          autoCapitalize="none"
          inputStyle={{ fontFamily: Fonts.yR, paddingLeft: 8 }}
          labelStyle={{ fontFamily: Fonts.yR, marginBottom: 6 }}
          containerStyle={{ marginBottom: 20, paddingHorizontal: 0 }}
          inputContainerStyle={{
            borderBottomWidth: 1,
            borderBottomColor: Colors.text,
          }}
        />
        <Input
          label="Password"
          leftIcon={{ type: "font-awesome", name: "lock" }}
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          placeholder="Your Password"
          autoCapitalize="none"
          inputStyle={{ fontFamily: Fonts.yR, paddingLeft: 8 }}
          labelStyle={{ fontFamily: Fonts.yR, marginBottom: 6 }}
          containerStyle={{ marginBottom: 30, paddingHorizontal: 0 }}
          inputContainerStyle={{
            borderBottomWidth: 1,
            borderBottomColor: Colors.text,
          }}
        />

        <PrimaryButton
          text={loading ? "Loading..." : "Log In"}
          onClick={signInWithEmail}
          disabled={loading}
        />
      </View>

      {/* Bottom Text */}
      <View style={styles.bottomTextContainer}>
        <TextButton
          content="Don't have an account?"
          text="Sign Up"
          onClick={() => router.push("/(auth)/signup")}
          disabled={loading}
          isBold
          textStyle={{ fontFamily: Fonts.yB }}
          contentStyle={{ fontFamily: Fonts.yB }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 100,
    paddingBottom: 290,
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 46,
    fontFamily: Fonts.yB,
    color: Colors.text,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 24,
    fontFamily: Fonts.yR,
    color: Colors.text,
    marginBottom: 40,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 10,
    flexGrow: 0,
    marginBottom: 5,
  },
  bottomTextContainer: {
    alignItems: "center",
  },
});