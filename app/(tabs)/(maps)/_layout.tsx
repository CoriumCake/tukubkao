import { Stack } from 'expo-router/stack'

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="maps" options={{ headerShown: false }} />
    </Stack>
  )
}

export default RootLayout;