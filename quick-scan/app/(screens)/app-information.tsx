import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  ScreenContainer,
  AppHeader,
  Card,
  Icon,
  Divider,
} from '../../components';

export default function AppInformationScreen() {
  const { theme } = useAppTheme();

  const infoCards = [
    { title: 'Application Version', value: '3.4.0 (Enterprise Material 3)', icon: 'appInfo' as const, subtitle: 'Latest Verified Pro Design Build' },
    { title: 'System Build Number', value: 'Build 402 (Rev 2026.08.01)', icon: 'target' as const, subtitle: 'Compiled with optimization level -O3' },
    { title: 'Package Identifier', value: 'ai.quickscan.studio.enterprise.m3', icon: 'secure' as const, subtitle: 'Signed Application Bundle ID' },
    { title: 'Target Mobile Platform', value: 'Universal Android / iOS / Web Fabric', icon: 'phone' as const, subtitle: 'Native 64-bit ARM & x86 architectures' },
    { title: 'React Native Runtime', value: '0.76.0 (Fabric UI & TurboModules)', icon: 'react' as const, subtitle: 'Zero bridge latency asynchronous renderer' },
    { title: 'Expo Foundation SDK', value: 'SDK 52.0.0 (Managed Sandbox)', icon: 'sparkles' as const, subtitle: 'OTA update & universal module compatible' },
  ];

  return (
    <ScreenContainer scrollable withSafeArea testID="app-info-screen">
      <AppHeader title="Technical App Info" subtitle="System Runtime & Build Metrics" showBack={true} />

      {/* 1. HERO BRANDING CARD */}
      <View style={[styles.heroCard, { backgroundColor: theme.customColors.primaryContainer, borderRadius: theme.radius[24], padding: theme.spacing[20], marginVertical: theme.spacing[16], alignItems: 'center' }]}>
        <View style={[styles.iconBadge, { backgroundColor: theme.customColors.surface, borderRadius: 26, elevation: 3 }]}>
          <Icon name="appInfo" size={48} color={theme.customColors.primary} />
        </View>
        <Text style={[theme.typography.headlineSmall, { color: theme.customColors.textPrimary, fontWeight: '800', marginTop: theme.spacing[16] }]}>
          System Diagnostic Metrics
        </Text>
        <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 6, textAlign: 'center', lineHeight: 20 }]}>
          All platform parameters below represent static verified environment placeholders for QuickScan Studio.
        </Text>
      </View>

      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        RUNTIME PARAMETERS ({infoCards.length})
      </Text>

      {/* 2. DISPLAY CARDS */}
      {infoCards.map((inf, idx) => (
        <Card
          key={`inf-${idx}`}
          variant="elevated"
          elevationLevel={1}
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.customColors.surface,
              borderRadius: theme.radius[22],
              padding: theme.spacing[18],
              marginBottom: theme.spacing[16],
              borderColor: theme.customColors.divider,
              borderWidth: StyleSheet.hairlineWidth,
            },
          ]}
        >
          <Pressable
            onPress={() => {}}
            style={styles.cardRow}
            accessibilityLabel={`Copy ${inf.title} value`}
          >
            <View style={[styles.iconWrap, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: 16 }]}>
              <Icon name={inf.icon} size={24} color={theme.customColors.primary} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 14 }}>
              <Text style={[theme.typography.labelMedium, { color: theme.customColors.textSecondary, fontWeight: '600' }]}>{inf.title.toUpperCase()}</Text>
              <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, fontWeight: '800', marginTop: 3 }]} numberOfLines={1}>
                {inf.value}
              </Text>
              <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 3 }]} numberOfLines={1}>
                {inf.subtitle}
              </Text>
            </View>
            <View style={[styles.copyBadge, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: 14 }]}>
              <Icon name="copy" size={18} color={theme.customColors.primary} />
            </View>
          </Pressable>
        </Card>
      ))}

      <Divider marginVertical={theme.spacing[20]} />

      <View style={[styles.envNote, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: theme.radius[20], padding: theme.spacing[18], marginBottom: theme.spacing[32] }]}>
        <View style={[styles.noteIconWrap, { backgroundColor: theme.customColors.primaryContainer, borderRadius: 14 }]}>
          <Icon name="info" size={22} color={theme.customColors.primary} />
        </View>
        <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, flex: 1, marginLeft: 14, lineHeight: 20 }]}>
          To run formal automated unit tests or verify React Native bundle integrity, refer to the development documentation in your local workspace root.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    width: '100%',
  },
  iconBadge: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    width: '100%',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyBadge: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  envNote: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  noteIconWrap: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
