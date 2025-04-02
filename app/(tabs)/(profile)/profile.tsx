import { SignOutButton } from '@/components/SignOutButton';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { View, Text } from 'react-native';

export default function ProfileScreen() {
  const { user } = useUser();

  return (
    <View>
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
  );
}
