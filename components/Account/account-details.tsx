import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Icon } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase'; // adjust path as needed
import { useRouter } from 'expo-router';

export default function AccountDetails() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [password, setPassword] = useState(""); // for password update

  // Fetch profile data
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setUsername(data.username || '');
      setAvatarUrl(data.avatar_url || null);
    }
  };

  // Fetch session and set userId
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.id) {
        setUserId(data.session.user.id);
        setEmail(data.session.user.email || '');
        fetchProfile(data.session.user.id); // fetch profile here
      }
    });
  }, []);

  // Pick and upload avatar
  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, quality: 1 });
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

      // Update profile with new avatar path (use user id)
      if (!userId) return Alert.alert('No user session');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', userId);
      if (updateError) return Alert.alert('Update failed', updateError.message);

      // Get the public URL for the new avatar
      let newAvatarUrl = filePath;
      if (!filePath.startsWith('http')) {
        newAvatarUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
      }
      setAvatarUrl(newAvatarUrl + '?t=' + Date.now());

      Alert.alert('Success', 'Avatar updated!');
    }
  };

  // Update username
  const updateProfile = async () => {
    if (!userId) return Alert.alert('No user session');
    const { error } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', userId);
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
  let avatarDisplayUrl = avatarUrl;
  if (avatarUrl && !avatarUrl.startsWith('http')) {
    avatarDisplayUrl = supabase.storage.from('avatars').getPublicUrl(avatarUrl).data.publicUrl;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-left" type="feather" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={{ width: 24 }} />
      </View>
      {/* Avatar */}
      <TouchableOpacity onPress={pickAvatar}>
        <Image
          source={{ uri: avatarDisplayUrl || 'https://via.placeholder.com/100' }}
          style={styles.avatar}
        />
        <Text style={{ textAlign: 'center', color: '#888' }}>Change Avatar</Text>
      </TouchableOpacity>
      {/* Editable fields */}
      <View style={styles.row}>
        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} />
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
