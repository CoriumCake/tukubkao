import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "react-native";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#F2F2F2',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: '#A5B68D', // muted green for both
        tabBarInactiveTintColor: '#A5B68D',
        headerShown: false,
      }}
    >
      <Tabs.Screen name="(home)" options={{
        title: "Home",
        tabBarIcon: ({ color, size, focused }) => (
          <Image
            source={require('../../assets/images/Icon_Home.png')}
            style={{ width: focused ? size + 2 : size, height: focused ? size + 2 : size, tintColor: color }}
          />
        ),
      }} />
      <Tabs.Screen name="(recipes)" options={{
        title: "Recipes",
        tabBarIcon: ({ color, size, focused }) => (
          <Image
            source={require('../../assets/images/Icon_Carrots.png')}
            style={{ width: focused ? size + 2 : size, height: focused ? size + 2 : size, tintColor: color }}
          />
        ),
      }} />
      <Tabs.Screen name="(inventory)" options={{
        title: "Fridge",
        tabBarIcon: ({ color, size, focused }) => (
          <Image
            source={require('../../assets/images/Icon_Fridge.png')}
            style={{ width: focused ? size + 2 : size, height: focused ? size + 2 : size, tintColor: color }}
          />
        ),
      }} />
      <Tabs.Screen name="(planner)" options={{
        title: "Planner",
        tabBarIcon: ({ color, size, focused }) => (
          <MaterialCommunityIcons
            name="calendar-text"
            size={focused ? size + 2 : size}
            color={color}
          />
        ),
      }} />
      <Tabs.Screen name="(profile)" options={{
        title: "Profile",
        tabBarIcon: ({ color, size, focused }) => (
          <Image
            source={require('../../assets/images/Icon_User.png')}
            style={{ width: focused ? size + 2 : size, height: focused ? size + 2 : size, tintColor: color }}
          />
        ),
      }} />
    </Tabs>
  );
};

export default TabsLayout;
