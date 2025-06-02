import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View, StyleSheet, Text, Platform } from "react-native";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import { Input } from "@rneui/themed";
import * as Linking from "expo-linking";
import TextButton from "../TextButton/TextButton";
import Fonts from "@/constants/Fonts";
import Colors from "@/constants/Colors";

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
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subTitle}>Enter your email to receive reset instructions</Text>
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
          keyboardType="email-address"
          inputStyle={{ fontFamily: Fonts.yR, paddingLeft: 8 }}
          labelStyle={{ fontFamily: Fonts.yR, marginBottom: 6 }}
          containerStyle={{ marginBottom: 30, paddingHorizontal: 0 }}
          inputContainerStyle={{
            borderBottomWidth: 1,
            borderBottomColor: Colors.text,
          }}
        />

        <PrimaryButton
          text={loading ? "Sending..." : "Send Reset Email"}
          onClick={handleForgotPassword}
          disabled={loading}
        />
      </View>

      {/* Bottom Text */}
      <View style={styles.bottomTextContainer}>
        <TextButton
          content=""
          text="Back to Login"
          onClick={() => router.back()}
          textStyle={{ fontFamily: Fonts.yR }}
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
