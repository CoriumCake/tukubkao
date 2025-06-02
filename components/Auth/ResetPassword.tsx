import { useEffect, useState } from "react";
import { Platform, Alert, View, StyleSheet, Text } from "react-native";
import { router, useLocalSearchParams, useRootNavigationState } from "expo-router";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import { Input } from "@rneui/themed";
import { supabase } from "@/lib/supabase";
import * as Linking from 'expo-linking';

interface TokenParams {
  access_token?: string;
  refresh_token?: string;
  type?: string;
}

interface NormalizedParams {
  [key: string]: string | undefined;
}

// Only runs on web
function getTokenFromHash(): TokenParams {
  if (typeof window === "undefined" || !window.location || typeof window.location.hash !== "string") {
    return {};
  }
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return {
    access_token: params.get("access_token") || undefined,
    refresh_token: params.get("refresh_token") || undefined,
    type: params.get("type") || undefined,
  };
}

function normalizeParams(params: Record<string, string | string[]>): NormalizedParams {
  const result: NormalizedParams = {};
  for (const key in params) {
    const value = params[key];
    result[key] = Array.isArray(value) ? value[0] : value;
  }
  return result;
}

export default function ResetPassword() {
  const params = useLocalSearchParams();
  const navState = useRootNavigationState();
  console.log('[ResetPassword] Raw params from useLocalSearchParams:', params);
  console.log('[ResetPassword] Root navigation state:', navState);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [hasShownError, setHasShownError] = useState(false);

  // Web: get tokens from hash. Mobile: get from params.
  const [tokens, setTokens] = useState<TokenParams>({});

  useEffect(() => {
    if (Platform.OS === "web") {
      const webTokens = getTokenFromHash();
      console.log('[ResetPassword] Web tokens from hash:', webTokens);
      if (
        tokens.access_token !== webTokens.access_token ||
        tokens.refresh_token !== webTokens.refresh_token ||
        tokens.type !== webTokens.type
      ) {
        setTokens(webTokens);
      }
    } else {
      const mobileParams = normalizeParams(params);
      console.log('[ResetPassword] Normalized mobile params:', mobileParams);
      const mobileTokens: TokenParams = {
        access_token: mobileParams.access_token,
        refresh_token: mobileParams.refresh_token,
        type: mobileParams.type || "recovery"
      };
      console.log('[ResetPassword] Processed mobile tokens:', mobileTokens);
      if (
        tokens.access_token !== mobileTokens.access_token ||
        tokens.refresh_token !== mobileTokens.refresh_token ||
        tokens.type !== mobileTokens.type
      ) {
        setTokens(mobileTokens);
      }
      // Manual fallback: parse initial URL if tokens are missing
      if (!mobileTokens.access_token || !mobileTokens.refresh_token) {
        Linking.getInitialURL().then(url => {
          console.log('[DEBUG] Initial URL:', url);
          if (url) {
            const parsed = Linking.parse(url);
            console.log('[DEBUG] Linking.parse:', parsed);
            if (parsed.queryParams?.access_token && parsed.queryParams?.refresh_token) {
              setTokens({
                access_token: parsed.queryParams.access_token as string,
                refresh_token: parsed.queryParams.refresh_token as string,
                type: (parsed.queryParams.type as string) || 'recovery',
              });
            }
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    console.log('[ResetPassword] Current tokens state:', tokens);
    if (!tokens?.type || !tokens?.access_token) {
      console.log('[ResetPassword] Invalid link reason:', {
        type: tokens?.type,
        access_token: tokens?.access_token
      });
      setStatus("Invalid reset link. Please request a new password reset link.");
      if (!hasShownError) {
        setHasShownError(true);
        Alert.alert(
          "Error",
          "Invalid or expired password reset link. Please try again.",
          [
            {
              text: "OK",
              onPress: () => {
                setTimeout(() => {
                  router.replace("/(auth)/forgot");
                }, 100);
              },
            },
          ],
          { cancelable: true }
        );
      }
    } else {
      setStatus("Reset link is valid. Please enter your new password.");
    }
  }, [tokens, hasShownError]);

  async function handleResetPassword() {
    if (newPassword !== confirmPassword) {
      setStatus("Passwords do not match. Please try again.");
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setStatus("Password must be at least 6 characters long.");
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    setLoading(true);
    setStatus("Updating your password...");
    try {
      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error("Missing required tokens");
      }
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
      if (sessionError) {
        setStatus("Reset link is invalid or expired. Please request a new one.");
        Alert.alert("Error", "Invalid or expired reset link. Please try again.");
        router.replace("/(auth)/forgot");
        return;
      }
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setStatus(`Error: ${error.message}`);
        Alert.alert("Error", error.message);
      } else {
        setStatus("Password reset successful! Redirecting to login...");
        Alert.alert(
          "Success",
          "Your password has been reset successfully!",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(auth)/login"),
            },
          ]
        );
      }
    } catch (error) {
      setStatus("An unexpected error occurred. Please try again.");
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password</Text>
      {status ? (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}
      <Input
        containerStyle={styles.verticallySpaced}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New password"
        secureTextEntry
        autoCapitalize="none"
      />
      <Input
        containerStyle={styles.verticallySpaced}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm new password"
        secureTextEntry
        autoCapitalize="none"
      />
      <View style={styles.mt20}>
        <PrimaryButton
          text="Update Password"
          onClick={handleResetPassword}
          disabled={loading}
        />
      </View>
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
  statusContainer: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  statusText: {
    color: "#666",
    textAlign: "center",
    fontSize: 14,
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
