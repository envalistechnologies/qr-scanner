/**
 * QuickScan Studio - Generate Tab Screen
 * Phase 16 Architectural Layer
 * Displays comprehensive template card grid covering all 19 supported production QR code types without UI redesigns.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useLocalization } from '../../hooks/useLocalization';
import { ScreenContainer, AppHeader, Card, Icon, Tag } from '../../components';

interface QRTypeOption {
  id: string;
  title: string;
  subtitle: string;
  iconName: any;
  category: string;
}

const qrTypes: QRTypeOption[] = [
  { id: 'web', title: 'Website URL', subtitle: 'Link to web domains or deep links', iconName: 'url', category: 'WEB' },
  { id: 'text', title: 'Plain Text', subtitle: 'Unencoded plain text blocks', iconName: 'text', category: 'DATA' },
  { id: 'wifi', title: 'Wi-Fi Network', subtitle: 'SSID wireless credential token', iconName: 'wifi', category: 'NETWORK' },
  { id: 'email', title: 'Email Address', subtitle: 'Recipient compose trigger', iconName: 'email', category: 'COMM' },
  { id: 'phone', title: 'Phone Number', subtitle: 'Instant cellular dial action', iconName: 'phone', category: 'COMM' },
  { id: 'sms', title: 'SMS Message', subtitle: 'Pre-populated text dispatch', iconName: 'sms', category: 'COMM' },
  { id: 'contact', title: 'Contact / vCard', subtitle: 'Electronic address book card', iconName: 'contact', category: 'ID' },
  { id: 'location', title: 'Geo Location', subtitle: 'GPS latitude and longitude point', iconName: 'location', category: 'GEO' },
  { id: 'calendar', title: 'Calendar Event', subtitle: 'iCalendar meeting schedule block', iconName: 'calendar', category: 'DATE' },
  { id: 'whatsapp', title: 'WhatsApp Chat', subtitle: 'Direct messaging deep link', iconName: 'whatsapp', category: 'SOCIAL' },
  { id: 'instagram', title: 'Instagram Profile', subtitle: 'Social feed and highlight link', iconName: 'instagram', category: 'SOCIAL' },
  { id: 'facebook', title: 'Facebook Portal', subtitle: 'Community page or personal feed', iconName: 'facebook', category: 'SOCIAL' },
  { id: 'linkedin', title: 'LinkedIn Card', subtitle: 'Professional resume and networking', iconName: 'linkedin', category: 'BUSINESS' },
  { id: 'youtube', title: 'YouTube Media', subtitle: 'Channel link and video streaming', iconName: 'youtube', category: 'MEDIA' },
  { id: 'playstore', title: 'Google Play Store', subtitle: 'Android app store listing matrix', iconName: 'playstore', category: 'APP' },
  { id: 'appstore', title: 'Apple App Store', subtitle: 'iOS marketplace app download token', iconName: 'appstore', category: 'APP' },
  { id: 'upi', title: 'UPI Payment', subtitle: 'Instant banking payment request VPA', iconName: 'wallet', category: 'FINANCE' },
  { id: 'bitcoin', title: 'Bitcoin Address', subtitle: 'Cryptocurrency wallet public receiver', iconName: 'bitcoin', category: 'CRYPTO' },
  { id: 'custom', title: 'Custom Payload', subtitle: 'Specialized enterprise data protocol', iconName: 'qr', category: 'CUSTOM' },
];

export default function GenerateTab() {
  const { theme } = useAppTheme();
  const { t } = useLocalization();

  const handleSelectType = (type: QRTypeOption) => {
    router.push({
      pathname: '/(screens)/qr-generator',
      params: { type: type.title, category: type.category, typeId: type.id },
    } as any);
  };

  const getTranslatedTitle = (id: string, def: string) => {
    if (id === 'web') return t('tpl_url', def);
    if (id === 'wifi') return t('tpl_wifi', def);
    if (id === 'contact') return t('tpl_vcard', def);
    if (id === 'text') return t('tpl_text', def);
    if (id === 'phone') return t('tpl_phone', def);
    if (id === 'email') return t('tpl_email', def);
    return def;
  };

  return (
    <ScreenContainer scrollable withSafeArea testID="generate-tab-screen">
      <AppHeader title={t('gen_header', 'Create QR Assets')} subtitle={t('gen_subtitle', 'Select a standardized generation type')} showBack={false} />

      <View style={[styles.banner, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: theme.radius[16], padding: theme.spacing[16], marginVertical: theme.spacing[12] }]}>
        <View style={styles.bannerHeader}>
          <Icon name="generator" size={24} color={theme.customColors.primary} />
          <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, marginLeft: theme.spacing[8], fontWeight: '700' }]}>
            {t('btn_qr_studio', 'Offline Generator Suite')}
          </Text>
        </View>
        <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary, marginTop: 6 }]}>
          {t('gen_subtitle', 'Select any of the 19 standard operational classifications below to enter the interactive real-time matrix studio.')}
        </Text>
      </View>

      <View style={styles.grid}>
        {qrTypes.map((item, index) => (
          <View key={index} style={styles.gridCell}>
            <Card
              variant="elevated"
              elevationLevel={1}
              onPress={() => handleSelectType(item)}
              style={styles.typeCard}
            >
              <View style={[styles.iconCircle, { backgroundColor: theme.customColors.primaryContainer, width: 52, height: 52, borderRadius: 26 }]}>
                <Icon name={item.iconName} size={28} color={theme.customColors.primary} />
              </View>
              <Tag label={item.category} variant="default" style={{ marginVertical: theme.spacing[8] }} />
              <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, fontWeight: '700', textAlign: 'center' }]} numberOfLines={1}>
                {getTranslatedTitle(item.id, item.title)}
              </Text>
              <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, textAlign: 'center', marginTop: 4 }]} numberOfLines={2}>
                {item.subtitle}
              </Text>
            </Card>
          </View>
        ))}
      </View>

      <View style={{ height: theme.spacing[48] }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  gridCell: {
    width: '48%',
    marginBottom: 16,
  },
  typeCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    minHeight: 180,
    justifyContent: 'center',
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
