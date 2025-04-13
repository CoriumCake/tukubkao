import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Page() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text>Home Content</Text>
      </View>
    </SafeAreaView>
  );
}
