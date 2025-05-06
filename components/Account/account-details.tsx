import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Icon } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase'; // adjust path as needed
import { useRouter } from 'expo-router';

export default function AccountDetails() {
  const router = useRouter();
  // Replace with real user data from state/store
  const [name, setName] = useState("Pitchayanee fernInwZa");
  const [email, setEmail] = useState("testuser@gmail.com");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [password, setPassword] = useState(""); // for password update

  // Pick and upload avatar
  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
    if (!result.canceled) {
      const file = result.assets[0];
      const fileExt = file.uri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      const response = await fetch(file.uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, blob, { upsert: true });
      if (uploadError) return Alert.alert('Upload failed', uploadError.message);

      // Update profile with new avatar path
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('email', email); // or use user id
      if (updateError) return Alert.alert('Update failed', updateError.message);

      setAvatarUrl(filePath);
      Alert.alert('Success', 'Avatar updated!');
    }
  };

  // Update name/email
  const updateProfile = async () => {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('email', email); // or use user id
    if (error) return Alert.alert('Update failed', error.message);
    Alert.alert('Success', 'Profile updated!');
  };

  // Update email
  const updateEmail = async () => {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return Alert.alert('Email update failed', error.message);
    Alert.alert('Success', 'Email updated!');
  };

  // Update password
  const updatePassword = async () => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return Alert.alert('Password update failed', error.message);
    Alert.alert('Success', 'Password updated!');
  };

  // Get public avatar URL
  const avatarPublicUrl = avatarUrl
    ? supabase.storage.from('avatars').getPublicUrl(avatarUrl).data.publicUrl
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-left" type="feather" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accounts</Text>
        <View style={{ width: 24 }} />
      </View>
      {/* Avatar */}
      <TouchableOpacity onPress={pickAvatar}>
        <Image
          source={{ uri: avatarPublicUrl || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <Text style={{ textAlign: 'center', color: '#888' }}>Change Avatar</Text>
      </TouchableOpacity>
      {/* Editable fields */}
      <View style={styles.row}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} onBlur={updateEmail} />
      </View>
      <TouchableOpacity onPress={updateProfile} style={styles.saveBtn}>
        <Text style={{ color: '#fff' }}>Save Profile</Text>
      </TouchableOpacity>
      <View style={styles.row}>
        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
      </View>
      <TouchableOpacity onPress={updatePassword} style={styles.saveBtn}>
        <Text style={{ color: '#fff' }}>Change Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginLeft: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 0,
    borderBottomColor: '#eee',
  },
  label: { width: 90, fontSize: 16, color: '#000', fontWeight: '500' },
  input: { flex: 1, borderBottomWidth: 1, borderColor: '#eee', fontSize: 15, color: '#888', padding: 4 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginBottom: 20 },
  saveBtn: { backgroundColor: '#A5B68D', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
});
