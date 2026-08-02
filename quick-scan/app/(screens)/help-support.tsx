import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  ScreenContainer,
  AppHeader,
  SearchBar,
  Card,
  Icon,
  Chip,
  EmptyState,
} from '../../components';

export default function HelpSupportScreen() {
  const { theme } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [uiState, setUiState] = useState<'faqs' | 'empty_search'>('faqs');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I generate and customize a custom QR matrix?',
      a: 'Navigate to the "Create" generator tab at the bottom navigation bar. Select your desired data payload type (Website URL, Wi-Fi Network, vCard, etc.), enter your information, and utilize our interactive customization controls to adjust color palettes, margins, and error correction levels.',
    },
    {
      q: 'Can I scan codes directly from saved gallery photos?',
      a: 'Yes! On the live camera viewfinder screen, tap the "Gallery / Album" icon located in the bottom action bar or top right toolbar. Choose any saved screenshot or photo from your device camera roll for instantaneous image processing.',
    },
    {
      q: 'Where are my scanned records and favorites stored?',
      a: 'All scan logs are archived automatically in your local offline MMKV/SQLite sandbox memory. Access them anytime by tapping the "History" tab or the "Favorites Vault" screen. Zero cloud servers are required.',
    },
    {
      q: 'Why did the scanner fail to decode a product barcode?',
      a: 'Ensure sufficient lighting by enabling the automatic flashlight or manual LED torch. For high-density retail barcodes (UPC-A, EAN-13, Code-128), hold your device lens steady at 4 to 6 inches distance to allow our auto-focus engine to calibrate.',
    },
    {
      q: 'How do I export my scan archive as CSV or JSON?',
      a: 'Open the "Settings & Preferences" screen, navigate to the Data Management & Backup section, and tap "Export Scan Archive". You can immediately save or share a complete structured data table.',
    },
  ];

  if (uiState === 'empty_search' || (searchQuery && searchQuery.toLowerCase() === 'none')) {
    return (
      <ScreenContainer scrollable={false} withSafeArea testID="help-empty-screen">
        <AppHeader title="Help & Support Center" subtitle="Knowledge Base" showBack={true} />

        <View style={[styles.stateRow, { marginTop: theme.spacing[12] }]}>
          <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, marginBottom: 8 }]}>
            SELECT DEMO UI STATE:
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
            <Chip label="✔ Active FAQ Center" selected={false} onPress={() => setUiState('faqs')} style={{ marginRight: 6 }} />
            <Chip label="○ No FAQ Result UI" selected={true} onPress={() => setUiState('empty_search')} style={{ marginRight: 6 }} />
          </ScrollView>
        </View>

        <View style={[styles.searchWrap, { marginTop: theme.spacing[12] }]}>
          <SearchBar
            value={searchQuery || 'UnmatchedTutorialTopic'}
            onChangeText={setSearchQuery}
            placeholder="Search FAQ or tutorials..."
            onClear={() => {
              setSearchQuery('');
              setUiState('faqs');
            }}
          />
        </View>

        <View style={{ flex: 1, minHeight: 450, justifyContent: 'center' }}>
          <EmptyState
            icon="search"
            title="Help Search Empty"
            description="We could not locate any matching FAQ articles, troubleshooting guides, or camera tutorials matching your keyword search."
            actionLabel="Clear Search Filter"
            onActionPress={() => {
              setSearchQuery('');
              setUiState('faqs');
            }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable withSafeArea testID="help-support-screen">
      <AppHeader title="Help & Support Center" subtitle="Studio Tutorials & Diagnostics" showBack={true} />

      {/* Demo State Switcher */}
      <View style={[styles.stateRow, { marginTop: theme.spacing[12] }]}>
        <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, marginBottom: 8 }]}>
          SELECT DEMO UI STATE:
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsWrap}>
          <Chip label="✔ Active FAQ Center" selected={true} onPress={() => setUiState('faqs')} style={{ marginRight: 6 }} />
          <Chip label="○ No FAQ Result UI" selected={false} onPress={() => setUiState('empty_search')} style={{ marginRight: 6 }} />
        </ScrollView>
      </View>

      {/* 1. HERO ILLUSTRATION CARD */}
      <View style={[styles.heroBadge, { backgroundColor: theme.customColors.primaryContainer, borderRadius: theme.radius[24], padding: theme.spacing[20], marginVertical: theme.spacing[14] }]}>
        <View style={styles.heroRow}>
          <View style={[styles.iconCircle, { backgroundColor: theme.customColors.surface, borderRadius: 14 }]}>
            <Icon name="help" size={38} color={theme.customColors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[theme.typography.headlineSmall, { color: theme.customColors.textPrimary, fontWeight: '800' }]}>
              How can we help?
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]}>
              Search our self-service documentation archive or connect with our specialized support architects below.
            </Text>
          </View>
        </View>
      </View>

      {/* 2. SEARCH BAR */}
      <View style={styles.searchWrap}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tutorials, camera troubleshooting or FAQs..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      <View style={{ height: theme.spacing[16] }} />

      {/* 3. EXPANDABLE FAQ CARDS SECTION */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginBottom: theme.spacing[10] }]}>
        FREQUENTLY ASKED QUESTIONS
      </Text>

      {faqs.map((f, idx) => {
        const isExpanded = expandedIndex === idx;
        return (
          <Card
            key={`faq-${idx}`}
            variant="elevated"
            elevationLevel={isExpanded ? 2 : 1}
            style={[
              styles.faqCard,
              {
                backgroundColor: isExpanded ? theme.customColors.surface : theme.customColors.surfaceVariant,
                borderColor: isExpanded ? theme.customColors.primary : theme.customColors.divider,
                borderWidth: isExpanded ? 1.5 : StyleSheet.hairlineWidth,
                borderRadius: theme.radius[18],
                padding: theme.spacing[16],
                marginBottom: theme.spacing[12],
              },
            ]}
          >
            <Pressable
              onPress={() => setExpandedIndex(isExpanded ? null : idx)}
              style={styles.faqHeader}
              accessibilityLabel={`Toggle FAQ question: ${f.q}`}
            >
              <Icon
                name="faq"
                size={22}
                color={isExpanded ? theme.customColors.primary : theme.customColors.textSecondary}
              />
              <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, fontWeight: '700', flex: 1, marginHorizontal: 12 }]}>
                {f.q}
              </Text>
              <Icon
                name={isExpanded ? 'chevronDown' : 'chevronRight'}
                size={20}
                color={theme.customColors.textSecondary}
              />
            </Pressable>

            {isExpanded && (
              <View style={[styles.answerBox, { marginTop: theme.spacing[12], borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.customColors.divider, paddingTop: theme.spacing[12] }]}>
                <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary, lineHeight: 22 }]}>
                  {f.a}
                </Text>
              </View>
            )}
          </Card>
        );
      })}

      <View style={{ height: theme.spacing[16] }} />

      {/* 4. CONTACT SUPPORT CARDS */}
      <Text style={[theme.typography.labelLarge, { color: theme.customColors.primary, fontWeight: '800', marginBottom: theme.spacing[10] }]}>
        NEED ADDITIONAL ENTERPRISE ASSISTANCE?
      </Text>

      <View style={styles.contactGrid}>
        {[
          { title: 'Submit User Feedback', desc: 'Share feature suggestions or UI proposals', icon: 'sms' as const, route: '/(screens)/feedback' },
          { title: 'Report Technical Bug', desc: 'Submit decoding logs or camera anomalies', icon: 'bug' as const, route: '/(screens)/feedback' },
          { title: 'Direct Email Desk', desc: 'envalistechnologies@gmail.com', icon: 'email' as const, route: null },
        ].map((cnt, idx) => (
          <Pressable
            key={`cnt-${idx}`}
            onPress={() => {
              if (cnt.route) router.push(cnt.route as any);
            }}
            style={[
              styles.contactCard,
              {
                backgroundColor: theme.customColors.surface,
                borderRadius: theme.radius[18],
                padding: theme.spacing[16],
                borderColor: theme.customColors.divider,
                borderWidth: StyleSheet.hairlineWidth,
                marginBottom: theme.spacing[12],
              },
            ]}
          >
            <View style={styles.contactRow}>
              <View style={[styles.contactIconWrap, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: 10 }]}>
                <Icon name={cnt.icon} size={24} color={theme.customColors.primary} />
              </View>
              <View style={{ flex: 1, marginHorizontal: 14 }}>
                <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, fontWeight: '700' }]}>{cnt.title}</Text>
                <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 3 }]}>{cnt.desc}</Text>
              </View>
              <Icon name="externalLink" size={20} color={theme.customColors.textSecondary} />
            </View>
          </Pressable>
        ))}
      </View>

      <View style={{ height: theme.spacing[32] }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stateRow: {
    width: '100%',
  },
  chipsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBadge: {
    width: '100%',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrap: {
    width: '100%',
  },
  faqCard: {
    width: '100%',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerBox: {
    width: '100%',
  },
  contactGrid: {
    width: '100%',
  },
  contactCard: {
    width: '100%',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactIconWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
