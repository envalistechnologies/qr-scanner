import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  ScreenContainer,
  AppHeader,
  Card,
  Icon,
  Divider,
} from '../../components';

export default function AboutScreen() {
  const { theme } = useAppTheme();

  return (
    <ScreenContainer scrollable withSafeArea testID="about-screen">
      <AppHeader title="About QuickScan Studio" subtitle="Application Architecture" showBack={true} />

      {/* 1. HERO LOGO & VERSION BRANDING */}
      <View style={styles.heroSection}>
        <View style={[styles.largeLogoBox, { backgroundColor: theme.customColors.primaryContainer, borderRadius: 36, elevation: 4 }]}>
          <Icon name="myQr" size={72} color={theme.customColors.primary} />
        </View>
        <Text style={[theme.typography.headlineLarge, { color: theme.customColors.textPrimary, fontWeight: '900', marginTop: theme.spacing[20], textAlign: 'center' }]}>
          QuickScan
        </Text>
        <Text style={[theme.typography.titleMedium, { color: theme.customColors.primary, fontWeight: '700', marginTop: 6, textAlign: 'center' }]}>
          Version 1.0.0
        </Text>
        <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary, marginTop: theme.spacing[14], textAlign: 'center', lineHeight: 22, maxWidth: 360 }]}>
          A premier Material 3 intelligent mobile optical scanning and design workstation. Built for high-density barcode decoding, instant offline vault archiving, and customized matrix synthesis.
        </Text>
      </View>

      <Divider marginVertical={theme.spacing[24]} />

      {/* 2. CORE FEATURE LIST CARD */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        ENTERPRISE FEATURE SUITE
      </Text>
      <Card variant="elevated" elevationLevel={1} style={[styles.infoCard, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[20], padding: theme.spacing[20], marginBottom: theme.spacing[28] }]}>
        {[
          { title: 'AI Optical Recognition Engine', desc: 'Real-time multi-code decoding with sub-50ms latency across 15+ symbol standards.', icon: 'target' as const },
          { title: 'Zero-Latency Offline Vault', desc: 'Secure local storage archive ensuring absolute data sovereignty and instantaneous recall.', icon: 'history' as const },
          { title: 'Dynamic QR Design Studio', desc: 'Tailored matrix generator supporting custom HSL palettes, error correction levels and branding templates.', icon: 'generator' as const },
          { title: 'Enterprise Security Compliance', desc: 'Strictly offline processing with zero background data telemetric extraction.', icon: 'secure' as const },
        ].map((feat, idx, arr) => (
          <View key={`feat-${idx}`} style={[styles.featureItem, idx < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.customColors.divider, paddingBottom: 16, marginBottom: 16 }]}>
            <View style={[styles.featIconWrap, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: 15 }]}>
              <Icon name={feat.icon} size={24} color={theme.customColors.primary} />
            </View>
            <View style={styles.featTextWrap}>
              <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, fontWeight: '700' }]}>{feat.title}</Text>
              <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4, lineHeight: 20 }]}>{feat.desc}</Text>
            </View>
          </View>
        ))}
      </Card>

      {/* 3. TECHNOLOGY STACK ARCHITECTURE */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        TECHNOLOGY STACK & RUNTIME
      </Text>
      <Card variant="outlined" style={[styles.infoCard, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: theme.radius[20], padding: theme.spacing[20], marginBottom: theme.spacing[28] }]}>
        {[
          { label: 'Core Framework', val: 'React Native 0.76 (Fabric Enabled)' },
          { label: 'Runtime Environment', val: 'Expo SDK 52 (Managed Workflow)' },
          { label: 'Animation Engine', val: 'React Native Reanimated 3 (120 FPS)' },
          { label: 'Language Standard', val: 'TypeScript 5.x (Strict Architecture)' },
          { label: 'Design System', val: 'Google Material 3 Mobile Typography' },
        ].map((tech, idx) => (
          <View key={`tech-${idx}`} style={[styles.techRow, { paddingVertical: 6 }]}>
            <Text style={[theme.typography.labelMedium, { color: theme.customColors.textSecondary, fontWeight: '600', flex: 1 }]}>{tech.label}</Text>
            <Text style={[theme.typography.labelLarge, { color: theme.customColors.textPrimary, fontWeight: '700', textAlign: 'right', flex: 1 }]} numberOfLines={1}>{tech.val}</Text>
          </View>
        ))}
      </Card>

      {/* 4. DEVELOPED BY SECTION */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        DEVELOPED BY
      </Text>
      <Card variant="elevated" elevationLevel={2} style={[styles.infoCard, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[20], padding: theme.spacing[20], marginBottom: theme.spacing[32] }]}>
        <View style={styles.devHeaderRow}>
          <View style={[styles.devAvatar, { backgroundColor: theme.customColors.primaryContainer, borderRadius: 18 }]}>
            <Icon name="developer" size={32} color={theme.customColors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[theme.typography.titleLarge, { color: theme.customColors.textPrimary, fontWeight: '800' }]}>Envalis Technologies</Text>
            <Text style={[theme.typography.bodyMedium, { color: theme.customColors.primary, fontWeight: '600', marginTop: 4 }]}>envalistechnologies@gmail.com</Text>
            <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]}>Software Development & Digital Marketing</Text>
          </View>
        </View>
      </Card>

      <View style={{ height: theme.spacing[24] }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
    width: '100%',
  },
  largeLogoBox: {
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  featIconWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  featTextWrap: {
    flex: 1,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  devHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  devAvatar: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
