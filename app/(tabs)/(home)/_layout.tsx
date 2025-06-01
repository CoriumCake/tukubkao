import { Stack } from 'expo-router/stack'

const RootLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#F2F2F2',
        },
        headerTintColor: '#000',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen 
        name="create" 
        options={{ 
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }} 
      />
    </Stack>
  )
}

export default RootLayout;