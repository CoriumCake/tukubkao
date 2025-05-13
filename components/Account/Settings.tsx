import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native'
import { useRouter } from 'expo-router'

export default function Settings() {
  const router = useRouter()

  const menuItems = [
    { label: 'Accounts', icon: require('../../assets/images/Icon_User4S.png'), route: '/account-settings' },
    { label: 'Notification', icon: require('../../assets/images/Icon_Bell.png'), route: '/notification-settings' },
    { label: 'Language', icon: require('../../assets/images/Icon_Language.png'), route: '/language-settings' },
    { label: 'Help', icon: require('../../assets/images/Icon_Help.png'), route: '/help' },
    { label: 'About', icon: require('../../assets/images/Icon_Info.png'), route: '/about' },
  ]

  const handleLogout = () => {
    // TODO: Add Supabase logout here
    router.replace('/(auth)/login') 
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.menuList}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={() => router.push(item.route as any)}  
          >
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.menuText}>{item.label}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={[styles.verticallySpaced, styles.mt20]}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backArrow: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuList: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 20,
  },
  arrow: {
    fontSize: 40,
    color: '#999',
  },
  logoutButton: { 
    backgroundColor: '#A5B68D', 
    paddingVertical: 12, 
    borderRadius: 8, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A5B68D',
    width: '80%', 
    marginTop: 30,
    alignSelf: 'center', 
  },
  
  logoutText: {
    color: '#FFFFFF', 
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  
  mt20: {
    marginTop: 20,
  },
  
})
