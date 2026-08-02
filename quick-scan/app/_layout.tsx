import '../utils/consoleSuppressor';
import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider as NavThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { AppProviders, useThemeContext } from '../providers';
import { AdInterstitialModal } from '../components';

const RootContent = () => {
  const { isDark, theme } = useThemeContext();

  const navigationTheme = React.useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: theme.customColors.background,
        card: theme.customColors.surface,
        text: theme.customColors.textPrimary,
        border: theme.customColors.divider,
        primary: theme.customColors.primary,
      },
    };
  }, [isDark, theme]);

  return (
    <NavThemeProvider value={navigationTheme}>
      <View style={{ flex: 1, backgroundColor: theme.customColors.background }}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <AdInterstitialModal />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.customColors.background },
            animationDuration: 150,
            gestureEnabled: true,
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="index" options={{ animation: 'fade' }} />
          <Stack.Screen name="onboarding" options={{ animation: 'fade_from_bottom' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(screens)" options={{ animation: 'fade_from_bottom' }} />
        </Stack>
      </View>
    </NavThemeProvider>
  );
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#121212' }}>
      <AppProviders>
        <RootContent />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
