import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColorScheme, View, Text } from 'react-native';
import { AuthProvider } from '@/lib/auth';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    'YsabeauOffice': require('../assets/fonts/YsabeauOffice-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Promise.all([
          // Add any other async operations here
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady && fontsLoaded) {
      // This tells the splash screen to hide immediately
      SplashScreen.hideAsync().catch(() => {
        /* ignore */
      });
    }
  }, [isReady, fontsLoaded]);

  if (!isReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8F2E6', justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
