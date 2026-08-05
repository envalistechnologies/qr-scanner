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
      <AppHeader title="About QuickScan" subtitle="Version 1.0.0" showBack={true} />

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
          A fast and reliable mobile scanning and code generation application. Built for instant barcode scanning, local history saving, and custom code generation.
        </Text>
      </View>

      <Divider marginVertical={theme.spacing[24]} />

      {/* 2. CORE FEATURE LIST CARD */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        KEY FEATURES
      </Text>
      <Card variant="elevated" elevationLevel={1} style={[styles.infoCard, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[20], padding: theme.spacing[20], marginBottom: theme.spacing[28] }]}>
        {[
          { title: 'Fast Optical Recognition', desc: 'Real-time decoding with high accuracy across standard barcode formats.', icon: 'target' as const },
          { title: 'Local Storage Vault', desc: 'Secure local device archiving ensuring complete privacy and instant access.', icon: 'history' as const },
          { title: 'Custom QR Generator', desc: 'Create tailored QR codes for websites, Wi-Fi networks, contacts, and more.', icon: 'generator' as const },
          { title: 'Privacy First', desc: 'Strictly local scanning and decoding with zero external background telemetry.', icon: 'secure' as const },
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
