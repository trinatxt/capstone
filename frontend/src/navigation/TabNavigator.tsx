import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";

import HomePage from "../screens/homepage";
import Controls from "../screens/controls";
import Dashboard from "../screens/dashboard";
import Events from "../screens/events";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = "home-outline";

          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Controls") iconName = "desktop-outline";
          else if (route.name === "Dashboard") iconName = "stats-chart-outline";
          else if (route.name === "Events") iconName = "calendar-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#056af7",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Controls" component={Controls} />
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Events" component={Events} />
    </Tab.Navigator>
  );
}
