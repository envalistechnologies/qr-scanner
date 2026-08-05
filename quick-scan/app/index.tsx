import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { ScreenContainer, PremiumButton, OutlineButton } from '../components';
import { StorageService } from '../storage/StorageService';

export default function SplashScreen() {
  const { theme } = useAppTheme();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkOnboarding = async () => {
      const hasSeen = await StorageService.getInstance().getItem<boolean>('has_seen_onboarding', false);
      if (isMounted) {
        if (hasSeen) {
          router.replace('/(tabs)');
        } else {
          setIsChecking(false);
        }
      }
    };
    checkOnboarding();
    return () => {
      isMounted = false;
    };
  }, []);

  if (isChecking) {
    return <View style={[styles.container, { flex: 1, backgroundColor: theme.customColors.background }]} />;
  }

  const handleSkipToMain = async () => {
    await StorageService.getInstance().setItem('has_seen_onboarding', true);
    router.replace('/(tabs)');
  };

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
          onPress={handleSkipToMain}
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
