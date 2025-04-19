import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      {/* Define screens within the auth group */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="forgot" options={{ headerShown: false }} />
      <Stack.Screen name="update-password" options={{ headerShown: false }} />
      {/* Add other auth screens here if needed, e.g., sign-up */}
    </Stack>
  );
}