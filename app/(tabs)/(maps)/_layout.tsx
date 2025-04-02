import { Stack } from 'expo-router/stack'

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  )
}

export default RootLayout;