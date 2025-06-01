import { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import PrimaryButton from "../PrimaryButton/PrimaryButton";
import { router } from "expo-router";
import { useFonts } from "expo-font";
import { supabase } from "@/lib/supabase";

export default function Splash() {
  const [fontsLoaded] = useFonts({
    'YsabeauOffice': require('../../assets/fonts/YsabeauOffice-Regular.ttf'),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)');
      }
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/SmallLogo.png')}
          style={{ width: 45, height: 45, marginRight: 8 }}
          resizeMode="contain"
        />
        <Text style={styles.textHeader}>TuKubKao</Text>
      </View>

      {/* Logo and Title Section */}
      <View style={styles.titleContainer}>
        <Image
          source={require('../../assets/images/splash-pic.png')}
          style={styles.image}
        />
        <Text style={styles.title}>TuKubKao</Text>
      </View>

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <PrimaryButton 
          text="Log in" 
          onClick={() => router.push('/(auth)/login')} 
        />
      </View>
      <View style={styles.buttonContainer}>
        <PrimaryButton 
          text="Sign up" 
          onClick={() => router.push('/(auth)/signup')} 
          backgroundColor="#FFFFFF"
          textColor="#000000"
          borderColor="#A3C9A8"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8F2E6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  textHeader: {
    fontFamily: 'YsabeauOffice',
    fontSize: 24,
    color: '#000000',
    textAlign: 'left',
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 15,
    marginTop: 20,
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 64,
    fontFamily: 'YsabeauOffice',
    color: '#000000',
  },
  buttonContainer: {
    marginTop: 12,
    width: '70%',
  },
});
