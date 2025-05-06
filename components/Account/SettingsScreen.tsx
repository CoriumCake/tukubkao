import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Icon } from '@rneui/themed';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  const settings = [
    { icon: 'user', label: 'Accounts', type: 'feather', onPress: () => router.push('/(tabs)/(profile)/account-details') },
    { icon: 'bell', label: 'Notification', type: 'feather', onPress: () => {} },
    { icon: 'language', label: 'Language', type: 'material', onPress: () => {} },
    { icon: 'help-circle', label: 'Help', type: 'feather', onPress: () => {} },
    { icon: 'info', label: 'About', type: 'feather', onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      {/* Settings List */}
      <View style={styles.list}>
        {settings.map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.listItem} onPress={item.onPress}>
            <Icon name={item.icon} type={item.type} size={22} color="#000" style={styles.listIcon} />
            <Text style={styles.listLabel}>{item.label}</Text>
            <Icon name="chevron-right" type="feather" size={22} color="#000" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Log out */}
      <TouchableOpacity style={styles.logout} onPress={() => Alert.alert('Log out pressed')}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  list: { marginTop: 10 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listIcon: { marginRight: 16 },
  listLabel: { flex: 1, fontSize: 16, color: '#000' },
  logout: { marginTop: 30, marginLeft: 24 },
  logoutText: { color: 'red', fontSize: 16 },
});
