import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../src/hooks/useApp';
import { Loading, Screen, ErrorText, Button } from '../src/components/UI';
import { colors as c } from '../src/theme';
function Routes() {
  const { loading, error, retry } = useApp();
  if (loading) return <Loading />;
  if (error) return <Screen title="Your garage is unavailable"><ErrorText>{error}</ErrorText><Button title="Try again" onPress={retry} /></Screen>;
  return <Stack screenOptions={{ headerStyle: { backgroundColor: c.background }, headerTintColor: c.text, contentStyle: { backgroundColor: c.background }, headerShadowVisible: false }}><Stack.Screen name="(tabs)" options={{ headerShown: false }} /><Stack.Screen name="vehicle/[id]" options={{ title: 'Vehicle details' }} /><Stack.Screen name="vehicle/form" options={{ title: 'Vehicle' }} /><Stack.Screen name="service/form" options={{ title: 'Service record' }} /><Stack.Screen name="fuel/form" options={{ title: 'Fuel record' }} /><Stack.Screen name="reminders" options={{ title: 'Maintenance reminders' }} /></Stack>;
}
export default function RootLayout() { return <SafeAreaProvider><StatusBar style="light" /><AppProvider><Routes /></AppProvider></SafeAreaProvider>; }
