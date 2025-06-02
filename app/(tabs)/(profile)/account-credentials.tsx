import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function AccountCredentials() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) {
        setEmail(data.session.user.email);
      }
    });
  }, []);

  const updateCredentials = async () => {
    if (!email) {
      Alert.alert('Email cannot be empty');
      return;
    }
    if (password && password.length < 6) {
      Alert.alert('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    let emailError = null;
    let passwordError = null;
    // Fetch latest session before updating
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) {
      setLoading(false);
      Alert.alert('Session error', 'User session is invalid or expired. Please log in again.');
      return;
    }
    if (email) {
      const { data, error } = await supabase.auth.updateUser({ email });
      emailError = error;
      if (!error && data?.user?.email !== email) {
        Alert.alert('Confirmation Required', 'A confirmation email has been sent to your new address. Please check your inbox to confirm the change.');
      }
    }
    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      passwordError = error;
    }
    setLoading(false);
    if (emailError) return Alert.alert('Email update failed', emailError.message);
    if (passwordError) return Alert.alert('Password update failed', passwordError.message);
    if (!emailError && !passwordError) {
      Alert.alert('Success', 'Credentials updated!');
      setPassword('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Enter your email"
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter new password"
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={updateCredentials} disabled={loading}>
        <Text style={styles.buttonText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
    color: '#222',
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f8f8f8',
  },
  button: {
    backgroundColor: '#A5B68D',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 