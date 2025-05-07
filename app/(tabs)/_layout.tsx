import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "react-native";

const TabsLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="(home)" options={{
        title: "Home",
        tabBarIcon: ({ color, size }) => (
          <Image
            source={require('../../assets/images/Icon_Home.png')}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
        headerShown: true,
      }} />
      <Tabs.Screen name="(inventory)" options={{
        title: "Fridge",
        tabBarIcon: ({ color, size }) => (
          <Image
            source={require('../../assets/images/Icon_Fridge.png')}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
        headerShown: true,
      }} />
      <Tabs.Screen name="(add-item)" options={{
        title: "Add Item",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="plus-circle" color={color} size={size} />
        ),
        headerShown: true,
      }} />
      <Tabs.Screen name="(maps)" options={{
        title: "Maps",
        tabBarIcon: ({ color, size }) => (
          <Image
            source={require('../../assets/images/Icon_Map.png')}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
        headerShown: true,
      }} />
      <Tabs.Screen name="(profile)" options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => (
          <Image
            source={require('../../assets/images/Icon_User.png')}
            style={{ width: size, height: size, tintColor: color }}
          />
        ),
        headerShown: true,
      }} />
    </Tabs>
  );
};

export default TabsLayout;
