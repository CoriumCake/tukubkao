import { Redirect, Stack } from 'expo-router'

export default function ProfileRoutesLayout() {

  return (
    <Stack>
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  )
}