import { Alert } from "react-native";
import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Input } from "@rneui/themed";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

import PrimaryButton from "../PrimaryButton/PrimaryButton";
import TextButton from "../TextButton/TextButton";

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    } else if (!session) {
      Alert.alert('Please check your inbox for email verification!');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope', color: '#000', size: 20 }}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Email@address.com"
          autoCapitalize={'none'}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <Input
          label="Password"
          leftIcon={{ type: 'font-awesome', name: 'lock', color: '#000', size: 20 }}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />
      </View>

      <View style={[styles.verticallySpaced, styles.mt20]}>
        <PrimaryButton
          text="Sign Up"
          onClick={signUpWithEmail}
          disabled={loading}
        />
      </View>

      <View style={styles.verticallySpaced}>
        <TextButton
          content="Already have an account?"
          text={<Text style={{ fontWeight: 'normal', fontFamily: 'Ysabeau-Bold' }}>Log In</Text>}
          onClick={() => router.push('/(auth)/login')}
          disabled={loading}
        />
      </View>
    </View>
  );
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
    marginTop: 100,
    color: '#000000',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Ysabeau-Regular',
    textAlign: 'center',
    color: '#000000',
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingLeft: 8,
  },
  inputText: {
    marginLeft: 4,
    color: '#000',
    fontFamily: 'Ysabeau-Regular',
  },
});
