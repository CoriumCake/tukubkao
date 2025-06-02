import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { Icon } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestNotificationPermissions, scheduleExpirationCheck, cancelAllNotifications } from '../../lib/notifications';

export default function SettingsScreen() {
  const router = useRouter();
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [ingredientExpEnabled, setIngredientExpEnabled] = useState(true);

  const settings = [
    { icon: 'user', label: 'Accounts', type: 'feather', onPress: () => router.push('/(tabs)/(profile)/account-credentials') },
    { icon: 'bell', label: 'Notification', type: 'feather', onPress: () => setNotificationModalVisible(true) },
    { icon: 'language', label: 'Language', type: 'material', onPress: () => setLanguageModalVisible(true) },
    { icon: 'help-circle', label: 'Help', type: 'feather', onPress: () => Alert.alert('About', 'you can contact us at tukubkao@gmail.com') },
    { icon: 'info', label: 'About', type: 'feather', onPress: () => Alert.alert('About', 'tukubkao is the best app for meal planning!') },
  ];

  useEffect(() => {
    // Load persisted toggle state
    (async () => {
      const value = await AsyncStorage.getItem('ingredientExpEnabled');
      if (value !== null) setIngredientExpEnabled(value === 'true');
    })();
  }, []);

  const handleToggleNotification = async (value: boolean) => {
    setIngredientExpEnabled(value);
    await AsyncStorage.setItem('ingredientExpEnabled', value.toString());
    if (value) {
      const granted = await requestNotificationPermissions();
      if (granted) {
        await scheduleExpirationCheck();
      }
    } else {
      await cancelAllNotifications();
    }
  };

  // Add sign out handler
  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/(auth)/login');
    } else {
      Alert.alert('Error signing out:', error.message);
    }
  }

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

      {/* Language Modal */}
      {languageModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => { setLanguageModalVisible(false); Alert.alert('Coming Soon', 'coming soon ....'); }}
            >
              <Text style={styles.modalButtonText}>ไทย (Thai)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#eee' }]}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: '#666' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Notification Modal */}
      {notificationModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ingredient Expiration Notifications</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
              <Text style={{ fontSize: 16, flex: 1 }}>Enable Notifications</Text>
              <Switch
                value={ingredientExpEnabled}
                onValueChange={handleToggleNotification}
                thumbColor={ingredientExpEnabled ? '#A5B68D' : '#ccc'}
                trackColor={{ true: '#C7D7B5', false: '#eee' }}
              />
            </View>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#eee' }]}
              onPress={() => setNotificationModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, { color: '#666' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Log out */}
      <TouchableOpacity style={styles.logout} onPress={handleSignOut}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 0 },
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 280,
    alignItems: 'center',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#A5B68D',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 6,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
