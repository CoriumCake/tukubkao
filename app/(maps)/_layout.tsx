import { Stack } from 'expo-router/stack'

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(home)/index" />
      <Stack.Screen name="(inventory)/inventory" />
    </Stack>
  )
}

export default RootLayout;