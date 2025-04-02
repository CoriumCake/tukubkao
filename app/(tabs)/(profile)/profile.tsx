import { SignOutButton } from '@/components/SignOutButton';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user } = useUser();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <SignedIn>
          <View>
            <Text>Hello {user?.emailAddresses[0].emailAddress}</Text>
            <SignOutButton />
          </View>
        </SignedIn>
        <SignedOut>
          <Link href="/(auth)/sign-in">
            <Text>Sign in</Text>
          </Link>
        </SignedOut>
      </View>
    </SafeAreaView>
  );
}
