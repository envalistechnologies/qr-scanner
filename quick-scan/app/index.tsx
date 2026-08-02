import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { ScreenContainer, PremiumButton, OutlineButton } from '../components';

export default function SplashScreen() {
  const { theme } = useAppTheme();

  return (
    <ScreenContainer scrollable={false} withSafeArea style={styles.container} testID="splash-screen">
      <View style={styles.centerContent}>
        <View
          style={[
            styles.logoContainer,
            {
              backgroundColor: theme.customColors.surfaceVariant,
              borderRadius: theme.radius[32],
              padding: theme.spacing[24],
              marginBottom: theme.spacing[32],
            },
            theme.elevation.level4,
          ]}
        >
          <Image
            source={require('../assets/images/logo.png')}
            style={{ width: 120, height: 120, }}
            contentFit="contain"
            accessibilityLabel="Quick Scan Logo"
          />
        </View>

        <Text
          style={[
            theme.typography.displayMedium,
            { color: theme.customColors.textPrimary, textAlign: 'center', marginBottom: theme.spacing[12], fontWeight: '800' },
          ]}
        >
          Quick Scan
        </Text>

        <Text
          style={[
            theme.typography.titleMedium,
            { color: theme.customColors.textSecondary, textAlign: 'center', maxWidth: '85%', marginBottom: theme.spacing[24] },
          ]}
        >
          Fast, accurate scanning for every QR code and barcode format you&apos;ll ever need.
        </Text>

      </View>

      <View style={[styles.footer, { paddingHorizontal: theme.spacing[16], paddingBottom: theme.spacing[24] }]}>
        <PremiumButton
          title="Begin Onboarding Flow"
          icon="arrowBack"
          onPress={() => router.push('/onboarding')}
          fullWidth
          style={{ marginBottom: theme.spacing[12] }}
          testID="btn-to-onboarding"
        />

        <OutlineButton
          title="Skip to Main App"
          icon="home"
          onPress={() => router.replace('/(tabs)')}
          fullWidth
          testID="btn-to-tabs"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
  },
});
