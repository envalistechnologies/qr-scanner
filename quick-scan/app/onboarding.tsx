import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '../hooks/useAppTheme';
import { ScreenContainer, PageTitle, PremiumButton, TextButton, Icon, Tag } from '../components';

interface OnboardingSlide {
  title: string;
  subtitle: string;
  description: string;
  iconName: any;
  badge: string;
}

const slides: OnboardingSlide[] = [
  {
    title: 'Instant Detection',
    subtitle: 'High-Velocity Recognition Engine',
    description: 'Scan QR codes and all standardized barcodes immediately using state-of-the-art camera frame decoding without delays.',
    iconName: 'qr',
    badge: 'ULTRA FAST',
  },
  {
    title: 'Smart Generator',
    subtitle: 'Custom Code Creation Studio',
    description: 'Generate production-ready QR codes for URLs, Wi-Fi networks, contacts, phone numbers, geo-locations, and calendar events.',
    iconName: 'generator',
    badge: 'CREATE & SHARE',
  },
  {
    title: 'Offline & Private',
    subtitle: 'Zero Tracking Architecture',
    description: 'All scanning history and decoding operations happen locally on your device with complete security and privacy protection.',
    iconName: 'privacy',
    badge: 'SECURE BY DEFAULT',
  },
];

export default function OnboardingScreen() {
  const { theme } = useAppTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.replace('/(tabs)');
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  return (
    <ScreenContainer scrollable={false} withSafeArea style={styles.container} testID="onboarding-screen">
      <View style={styles.topHeader}>
        <Tag label={`STEP ${currentSlide + 1} OF ${slides.length}`} variant="default" />
        <TextButton
          title="Skip"
          onPress={() => router.replace('/(tabs)')}
          style={styles.skipButton}
        />
      </View>

      <View style={styles.slideContent}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.customColors.primaryContainer,
              width: 140,
              height: 140,
              borderRadius: 70,
              marginBottom: theme.spacing[32],
            },
            theme.elevation.level2,
          ]}
        >
          <Icon name={slide.iconName} size={72} color={theme.customColors.primary} />
        </View>

        <Tag label={slide.badge} variant="success" dot style={{ marginBottom: theme.spacing[12] }} />

        <PageTitle title={slide.title} subtitle={slide.subtitle} style={{ marginBottom: theme.spacing[16] }} />

        <Text
          style={[
            theme.typography.bodyLarge,
            { color: theme.customColors.textSecondary, lineHeight: 26, paddingHorizontal: theme.spacing[16] },
          ]}
        >
          {slide.description}
        </Text>
      </View>

      <View style={[styles.footer, { paddingVertical: theme.spacing[24] }]}>
        <View style={[styles.indicatorRow, { marginBottom: theme.spacing[24] }]}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index === currentSlide ? theme.customColors.primary : theme.customColors.outline,
                  width: index === currentSlide ? 32 : 10,
                  height: 10,
                  borderRadius: 5,
                  marginHorizontal: 4,
                },
              ]}
            />
          ))}
        </View>

        <PremiumButton
          title={isLast ? 'Enter Quick Scan Shell' : 'Continue'}
          icon={isLast ? 'home' : 'chevronRight'}
          onPress={handleNext}
          fullWidth
          testID="btn-next-onboarding"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: 8,
  },
  skipButton: {
    alignSelf: 'flex-end',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {},
});
