import { Stack } from 'expo-router/stack'

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="planner" options={{ headerShown: false }} />
    </Stack>
  )
}

export default RootLayout;