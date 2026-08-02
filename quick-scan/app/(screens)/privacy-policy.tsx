import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  ScreenContainer,
  AppHeader,
  Card,
  Icon,
  Chip,
  Divider,
} from '../../components';

export default function PrivacyPolicyScreen() {
  const { theme } = useAppTheme();
  const [activeSection, setActiveSection] = useState<string>('Overview');

  const sections = [
    {
      id: 'Overview',
      title: '1. Executive Privacy Overview',
      subtitle: 'Local-first architecture ensuring zero telemetric extraction.',
      content:
        'At QuickScan, your digital privacy and data sovereignty represent the core foundation of our product design. We utilize a strictly offline-first scanning engine. Unlike legacy free scanning applications that transmit decoded URLs, contact cards, and Wi-Fi credentials to centralized cloud analytics servers, QuickScan performs all image recognition and matrix synthesis directly upon your local smartphone silicon using native visual machine learning pipelines.',
    },
    {
      id: 'Camera',
      title: '2. Camera & Viewfinder Access',
      subtitle: 'Real-time optical frame buffers without storage retention.',
      content:
        'When you grant QuickScan permission to utilize your mobile device camera, our optical recognition engine accesses raw video frames solely in volatile active Random Access Memory (RAM). Frames are immediately processed for QR matrices and product barcodes, and discarded in real-time within microseconds. No photography, video feeds, or ambient environmental data is ever written to internal flash storage unless you manually execute a screenshot or gallery save.',
    },
    {
      id: 'Storage',
      title: '3. Local Vault & History Storage',
      subtitle: 'On-device MMKV architecture under user control.',
      content:
        'All scanned records, favorited bookmarks, and custom synthesized QR codes are stored inside a secure, encrypted local SQLite/MMKV sandbox directory on your filesystem. You retain unilateral control over this data archive. You can modify, export as JSON/CSV tables, or permanently wipe your entire history vault at any time via our Data Management console.',
    },
    {
      id: 'Permissions',
      title: '4. Third-Party Libraries & Networking',
      subtitle: 'No advertising SDKs or covert behavioral trackers.',
      content:
        'QuickScan Studio does not embed commercial advertising trackers, cross-site promotional cookies, or behavioral attribution frameworks. Network requests occur exclusively when you explicitly instruct the application to open a scanned URL in your preferred external web browser or transmit a shared payload over system messaging protocols.',
    },
    {
      id: 'Contact',
      title: '5. Privacy & Legal Compliance Contact',
      subtitle: 'Direct developer communication channels.',
      content:
        'For executive inquiries regarding data privacy compliance (GDPR, CCPA, SOC2) or software auditing requests, contact Envalis Technologies directly at envalistechnologies@gmail.com.',
    },
  ];

  return (
    <ScreenContainer scrollable withSafeArea testID="privacy-policy-screen">
      <AppHeader title="Privacy Policy & Legal" subtitle="Data Sovereignty Architecture" showBack={true} />

      {/* 1. HERO BANNER */}
      <View style={[styles.heroBadgeCard, { backgroundColor: theme.customColors.primaryContainer, borderRadius: theme.radius[24], padding: theme.spacing[20], marginVertical: theme.spacing[16] }]}>
        <View style={styles.heroRow}>
          <View style={[styles.iconBox, { backgroundColor: theme.customColors.surface, borderRadius: 18 }]}>
            <Icon name="privacy" size={32} color={theme.customColors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[theme.typography.titleLarge, { color: theme.customColors.textPrimary, fontWeight: '800' }]}>
              100% Offline & Private
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]}>
              Last Updated: 2026 • Effective Date: Immediate
            </Text>
          </View>
        </View>
      </View>

      {/* 2. TABLE OF CONTENTS */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }]}>
        TABLE OF CONTENTS (TAP TO NAVIGATE)
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.tocWrap, { marginBottom: theme.spacing[24] }]}>
        {sections.map((sec) => (
          <Chip
            key={sec.id}
            label={sec.title.split('.')[1].trim()}
            selected={activeSection === sec.id}
            style={{ marginRight: 8 }}
            onPress={() => setActiveSection(sec.id)}
          />
        ))}
      </ScrollView>

      {/* 3. SECTION CARDS */}
      {sections.map((sec, idx) => (
        <Card
          key={`sec-card-${idx}`}
          variant="elevated"
          elevationLevel={activeSection === sec.id ? 2 : 1}
          style={[
            styles.policyCard,
            {
              backgroundColor: activeSection === sec.id ? theme.customColors.surface : theme.customColors.surfaceVariant,
              borderColor: activeSection === sec.id ? theme.customColors.primary : theme.customColors.divider,
              borderWidth: activeSection === sec.id ? 1.5 : StyleSheet.hairlineWidth,
              borderRadius: theme.radius[22],
              padding: theme.spacing[20],
              marginBottom: theme.spacing[20],
            },
          ]}
        >
          <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, fontWeight: '800' }]}>
            {sec.title}
          </Text>
          <Text style={[theme.typography.labelMedium, { color: theme.customColors.primary, fontWeight: '600', marginTop: 4 }]}>
            {sec.subtitle}
          </Text>
          <Divider marginVertical={theme.spacing[14]} />
          <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary, lineHeight: 24 }]}>
            {sec.content}
          </Text>
        </Card>
      ))}

      <View style={[styles.consentBadge, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: theme.radius[20], padding: theme.spacing[18], marginVertical: theme.spacing[16] }]}>
        <View style={[styles.smallIconWrap, { backgroundColor: 'rgba(52, 199, 89, 0.15)', borderRadius: 12 }]}>
          <Icon name="secure" size={24} color={theme.customColors.success} />
        </View>
        <Text style={[theme.typography.labelMedium, { color: theme.customColors.textPrimary, flex: 1, marginLeft: 14, fontWeight: '700', lineHeight: 20 }]}>
          By operating QuickScan Studio, your device complies with our offline data protection standards.
        </Text>
      </View>

      <View style={{ height: theme.spacing[32] }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroBadgeCard: {
    width: '100%',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tocWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  policyCard: {
    width: '100%',
  },
  consentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  smallIconWrap: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
