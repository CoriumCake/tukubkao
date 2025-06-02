import React, { useState } from "react";
import { Alert, StyleSheet, View, Text, TouchableOpacity, Image, TextInput, ActivityIndicator } from "react-native";
import { supabase } from "@/lib/supabase";
import { Input } from "@rneui/themed";
import { router } from "expo-router";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import TextButton from "../TextButton/TextButton";
import Fonts from "@/constants/Fonts";
import Colors from "@/constants/Colors";
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  async function pickAvatar() {
    setAvatarUploading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photos.');
        setAvatarUploading(false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatar(result.assets[0].uri);
        setAvatarUploading(false);
      } else {
        setAvatarUploading(false);
      }
    } catch (e) {
      setAvatarUploading(false);
      Alert.alert('Error', 'Failed to pick image.');
    }
  }

  async function uploadAvatar(userId: string): Promise<string | null> {
    if (!avatar) return null;
    try {
      setAvatarUploading(true);
      // Fetch the image and convert to base64
      const response = await fetch(avatar);
      const blob = await response.blob();
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const fileExt = 'jpg';
          const fileName = `${userId}_${Date.now()}.${fileExt}`;
          const filePath = `user-avatar/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('user-avatar').upload(filePath, decode(base64), {
            contentType: 'image/jpeg',
            upsert: true,
          });
          if (uploadError) {
            setAvatarUploading(false);
            Alert.alert('Upload failed', uploadError.message);
            resolve(null);
            return;
          }
          const { data: publicUrlData } = supabase.storage.from('user-avatar').getPublicUrl(filePath);
          setAvatarUploading(false);
          resolve(publicUrlData?.publicUrl || null);
        };
        reader.onerror = () => {
          setAvatarUploading(false);
          reject(null);
        };
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      setAvatarUploading(false);
      return null;
    }
  }

  async function signUpWithEmail() {
    if (!username || username.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters long.');
      return;
    }
    setLoading(true);
    console.log('Signing up with:', { email, username, avatar });
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
        setLoading(false);
        return;
      } else {
        Alert.alert(error.message);
        setLoading(false);
        return;
      }
    } else if (session) {
      let avatarUrl = null;
      if (avatar) {
        avatarUrl = await uploadAvatar(session.user.id);
        console.log('Avatar uploaded, public URL:', avatarUrl);
      }
      const profilePayload = {
        id: session.user.id,
        username: username || generateUsername(email),
        avatar_url: avatarUrl,
        c_post: 0,
        c_followers: 0,
        c_following: 0,
      };
      console.log('Inserting profile with payload:', profilePayload);
      const { error: profileError, data: profileData } = await supabase.from("profiles").upsert([
        profilePayload
      ]);
      console.log('Profile insert response:', { profileError, profileData });
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
          setLoading(false);
          return;
        } else {
          Alert.alert("Error creating profile:", profileError.message);
          setLoading(false);
          return;
        }
      } else {
        router.replace("/(tabs)" as any);
      }
    } else {
      Alert.alert("Please check your inbox for email verification!");
      setLoading(false);
      return;
    }
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

      {/* Avatar Picker */}
      <TouchableOpacity onPress={pickAvatar} style={{ alignSelf: 'center', marginBottom: 16 }}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#A5B68D' }} />
        ) : (
          <View style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#A5B68D' }}>
            <Text style={{ color: '#aaa' }}>Pick Avatar</Text>
          </View>
        )}
        {avatarUploading && <ActivityIndicator style={{ position: 'absolute', top: 35, left: 35 }} />}
      </TouchableOpacity>

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
          containerStyle={{ marginBottom: 20, paddingHorizontal: 0 }}
          inputContainerStyle={{
            borderBottomWidth: 1,
            borderBottomColor: Colors.text,
          }}
        />
        <Input
          label="Username"
          leftIcon={{ type: "font-awesome", name: "user" }}
          onChangeText={setUsername}
          value={username}
          placeholder="Choose a username"
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
          disabled={loading || avatarUploading}
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
