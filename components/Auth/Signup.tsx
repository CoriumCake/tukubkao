import React, { useState } from "react";
import { Alert, StyleSheet, View, Text } from "react-native";
import { supabase } from "@/lib/supabase";
import { Input } from "@rneui/themed";
import { router } from "expo-router";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import TextButton from "../TextButton/TextButton";
import Fonts from "@/constants/Fonts";
import Colors from "@/constants/Colors";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message && error.message.toLowerCase().includes('already registered')) {
        Alert.alert('Email already registered', 'This email is already in use. Please use a different email or log in.');
      } else {
        Alert.alert(error.message);
      }
    } else if (session) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: session.user.id,
          username: generateUsername(email),
          avatar_url: null,
          c_post: 0,
          c_followers: 0,
          c_following: 0,
        },
      ]);

      if (profileError) {
        if (
          profileError.message &&
          (profileError.message.toLowerCase().includes('duplicate key value') ||
           profileError.message.toLowerCase().includes('unique constraint'))
        ) {
          Alert.alert(
            "Email already registered",
            "This email is already in use. Please use a different email or log in."
          );
        } else {
          Alert.alert("Error creating profile:", profileError.message);
        }
      } else {
        router.replace("/(tabs)" as any);
      }
    } else {
      Alert.alert("Please check your inbox for email verification!");
    }
    setLoading(false);
  }

  function generateUsername(email: string): string {
    let base = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    if (base.length < 4) {
      base = base + Math.random().toString(36).substring(2, 6 - base.length);
    }
    return base;
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subTitle}>Sign up to get started</Text>
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
          text={loading ? "Loading..." : "Sign Up"}
          onClick={signUpWithEmail}
          disabled={loading}
        />
      </View>

      {/* Bottom Text */}
      <View style={styles.bottomTextContainer}>
        <TextButton
          content="Already have an account?"
          text="Log In"
          onClick={() => router.push("/(auth)/login")}
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
