import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View, StyleSheet, Text, Platform } from "react-native";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import { Input } from "@rneui/themed";
import * as Linking from "expo-linking";
import TextButton from "../TextButton/TextButton";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleForgotPassword() {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      // Use Linking to create a deep link for mobile
      const redirectTo =
        Platform.OS === "web"
          ? `${window.location.origin}/reset-password?type=recovery`
          : Linking.createURL("/reset-password?type=recovery");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "Success",
          "Please check your email for password reset instructions. The link will expire in 24 hours.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email to receive reset instructions</Text>
      <Input
        containerStyle={styles.verticallySpaced}
        value={email}
        onChangeText={setEmail}
        placeholder="email@address.com"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View style={styles.mt20}>
        <PrimaryButton
          text="Send Reset Email"
          onClick={handleForgotPassword}
          disabled={loading}
        />
      </View>
      <TextButton 
        content="" 
        text="Back to Login" 
        onClick={() => router.back()} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8F2E6",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
