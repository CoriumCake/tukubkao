import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/auth';

export default function AuthLayout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F2E6' }}>
        <ActivityIndicator size="large" color="#A5B68D" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forgot" options={{ headerShown: false }} />
      <Stack.Screen name="update-password" options={{ headerShown: false }} />
    </Stack>
  );
}