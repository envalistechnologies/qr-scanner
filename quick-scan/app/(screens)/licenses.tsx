import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  ScreenContainer,
  AppHeader,
  Icon,
  Divider,
  BottomSheet,
  OutlineButton,
} from '../../components';

interface LicenseItem {
  name: string;
  version: string;
  license: string;
  author: string;
  summary: string;
}

const LIBRARIES: LicenseItem[] = [
  {
    name: '@shopify/flash-list',
    version: '1.7.1',
    license: 'MIT License',
    author: 'Shopify Engineering',
    summary: 'High-performance React Native virtualized list replacing FlatList with recycler view technology.',
  },
  {
    name: 'react-native-reanimated',
    version: '3.16.1',
    license: 'MIT License',
    author: 'Software Mansion',
    summary: 'High frame rate animation library enabling UI micro-interactions at 120 FPS directly on native UI thread.',
  },
  {
    name: 'expo-router',
    version: '4.0.0',
    license: 'MIT License',
    author: 'Expo & Expo Router Core Team',
    summary: 'File-system based universal routing engine for React Native applications across iOS, Android and Web.',
  },
  {
    name: 'expo-camera',
    version: '15.0.14',
    license: 'MIT License',
    author: 'Expo Foundation',
    summary: 'React Native camera component offering live optical frame processing and barcode recognition hardware access.',
  },
  {
    name: '@expo/vector-icons',
    version: '14.0.0',
    license: 'MIT License',
    author: 'Expo & Material Community Icons Team',
    summary: 'Comprehensive SVG iconography library featuring thousands of Material 3 and specialized vector symbols.',
  },
  {
    name: 'react-native',
    version: '0.76.0',
    license: 'MIT License',
    author: 'Meta Platforms Inc. & Community',
    summary: 'Core framework for building native cross-platform mobile applications using JavaScript & TypeScript.',
  },
  {
    name: 'react-native-safe-area-context',
    version: '4.12.0',
    license: 'MIT License',
    author: 'Th3rd Wave & Contributors',
    summary: 'Flexible handling of device cutouts, dynamic islands, foldables, and notch boundaries in native views.',
  },
  {
    name: 'typescript',
    version: '5.3.3',
    license: 'Apache 2.0 License',
    author: 'Microsoft Corporation',
    summary: 'Strictly typed superset of JavaScript ensuring robust compile-time contract checking and reliability.',
  },
];

export default function LicensesScreen() {
  const { theme } = useAppTheme();
  const [activeLib, setActiveLib] = useState<LicenseItem | null>(null);

  return (
    <ScreenContainer scrollable withSafeArea testID="licenses-screen">
      <AppHeader title="Open Source Licenses" subtitle="Third-Party Acknowledgements" showBack={true} />

      {/* 1. HERO DESCRIPTION BANNER */}
      <View style={[styles.heroBadge, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: theme.radius[20], padding: theme.spacing[16], marginVertical: theme.spacing[16] }]}>
        <View style={styles.heroRow}>
          <View style={[styles.iconWrap, { backgroundColor: theme.customColors.surface, borderRadius: 10 }]}>
            <Icon name="license" size={26} color={theme.customColors.primary} />
          </View>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, fontWeight: '800' }]}>
              Built Upon Excellence
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 2 }]}>
              QuickScan incorporates the following permissive open-source frameworks and libraries.
            </Text>
          </View>
        </View>
      </View>

      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginBottom: theme.spacing[10] }]}>
        LICENSED PACKAGES ({LIBRARIES.length})
      </Text>

      {/* 2. LIBRARY LIST CARDS */}
      <View style={[styles.listCard, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[20], paddingHorizontal: theme.spacing[16], marginBottom: theme.spacing[24] }]}>
        {LIBRARIES.map((lib, idx, arr) => (
          <Pressable
            key={`lib-${idx}`}
            onPress={() => setActiveLib(lib)}
            style={[
              styles.libRow,
              { paddingVertical: theme.spacing[14] },
              idx < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.customColors.divider },
            ]}
            accessibilityLabel={`View open source license for ${lib.name}`}
          >
            <View style={styles.libMain}>
              <View style={styles.titleVersionRow}>
                <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, fontWeight: '700', flex: 1 }]} numberOfLines={1}>
                  {lib.name}
                </Text>
                <View style={[styles.badge, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 }]}>
                  <Text style={[theme.typography.labelSmall, { color: theme.customColors.primary, fontWeight: '700' }]}>v{lib.version}</Text>
                </View>
              </View>
              <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]} numberOfLines={1}>
                {lib.author} • {lib.license}
              </Text>
            </View>

            <View style={styles.chevronWrap}>
              <Icon name="chevronRight" size={20} color={theme.customColors.textSecondary} />
            </View>
          </Pressable>
        ))}
      </View>

      {/* --- LICENSE DETAIL BOTTOM SHEET --- */}
      <BottomSheet
        visible={!!activeLib}
        onClose={() => setActiveLib(null)}
        title={activeLib ? `${activeLib.name} (${activeLib.license})` : 'License Details'}
      >
        {activeLib && (
          <View style={styles.sheetBox}>
            <Text style={[theme.typography.titleSmall, { color: theme.customColors.primary, fontWeight: '700' }]}>
              Version {activeLib.version} • Maintained by {activeLib.author}
            </Text>
            <Divider marginVertical={theme.spacing[12]} />
            <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textPrimary, lineHeight: 22, fontWeight: '600', marginBottom: 12 }]}>
              {activeLib.summary}
            </Text>
            <View style={[styles.licenseTextWrap, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: theme.radius[12], padding: theme.spacing[14], marginBottom: theme.spacing[16] }]}>
              <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, fontFamily: 'monospace', lineHeight: 18 }]}>
                Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software...
              </Text>
            </View>
            <OutlineButton title="Close License" icon="close" onPress={() => setActiveLib(null)} fullWidth />
          </View>
        )}
      </BottomSheet>

      <View style={{ height: theme.spacing[32] }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroBadge: {
    width: '100%',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCard: {
    width: '100%',
  },
  libRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  libMain: {
    flex: 1,
    justifyContent: 'center',
  },
  titleVersionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevronWrap: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetBox: {
    width: '100%',
  },
  licenseTextWrap: {
    width: '100%',
  },
});
