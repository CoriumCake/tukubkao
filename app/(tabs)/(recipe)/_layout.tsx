import { Stack } from 'expo-router/stack'

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="recipe" options={{ headerShown: false }} />
    </Stack>
  )
}

export default RootLayout;