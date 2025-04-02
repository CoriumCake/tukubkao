import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TabsLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="(home)" options={{
        title: "Home",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home" color={color} size={size} />
        ),
        headerShown: false,
      }} />
      <Tabs.Screen name="(inventory)" options={{
        title: "Inventory",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="clipboard-list" color={color} size={size} />
        ),
        headerShown: false,
      }} />
      <Tabs.Screen name="(add-item)" options={{
        title: "Add Item",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="plus-circle" color={color} size={size} />
        ),
        headerShown: false,
      }} />
      <Tabs.Screen name="(maps)" options={{
        title: "Maps",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="map" color={color} size={size} />
        ),
        headerShown: false,
      }} />
      <Tabs.Screen name="(profile)" options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account" color={color} size={size} />
        ),
        headerShown: false,
      }} />
    </Tabs>
  );
};

export default TabsLayout;