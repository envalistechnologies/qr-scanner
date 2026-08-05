import React from 'react';
import { Stack } from 'expo-router';
import { useThemeContext } from '../../providers/ThemeProvider';

export default function ScreensLayout() {
  const { theme } = useThemeContext();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.customColors.background },
        animationDuration: 150,
        gestureEnabled: true,
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="scanner" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="scan-result" options={{ animation: 'fade_from_bottom' }} />
      <Stack.Screen name="qr-generator" options={{ animation: 'fade_from_bottom' }} />
      <Stack.Screen name="gallery-scanner" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="favorites" options={{ animation: 'fade_from_bottom' }} />
      <Stack.Screen name="search" options={{ animation: 'fade' }} />
      <Stack.Screen name="about" options={{ animation: 'fade_from_bottom' }} />
      <Stack.Screen name="privacy-policy" options={{ animation: 'fade_from_bottom' }} />
      <Stack.Screen name="help-support" options={{ animation: 'fade_from_bottom' }} />
      <Stack.Screen name="rate-app" options={{ animation: 'fade_from_bottom' }} />
    </Stack>
  );
}
