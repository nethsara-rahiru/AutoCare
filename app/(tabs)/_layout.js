import React from "react";
import { Tabs } from "expo-router";
import {
  House,
  Car,
  Wrench,
  Fuel,
  ChartNoAxesCombined,
} from "lucide-react-native";
import { colors as c } from "../../src/theme";
const tabs = [
  ["index", "Home", House],
  ["vehicles", "Vehicles", Car],
  ["services", "Services", Wrench],
  ["fuel", "Fuel", Fuel],
  ["reports", "Reports", ChartNoAxesCombined],
];
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: "AUTOCARE",
        headerStyle: { backgroundColor: c.background },
        headerTintColor: c.accent,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
      }}
    >
      {tabs.map(([name, title, Icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color, size }) => <Icon size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
