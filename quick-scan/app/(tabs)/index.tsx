import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useLocalization } from '../../hooks/useLocalization';
import { useHistory, useFavorites, useGenerator } from '../../hooks';
import { useResponsive } from '../../utils/responsive';
import {
  ScreenContainer,
  Card,
  PremiumButton,
  OutlineButton,
  IconButton,
  Icon,
  Tag,
} from '../../components';
import { AppTheme } from '../../types/theme';

// =========================================================
// REUSABLE INTERACTIVE ANIMATED WRAPPER (MICRO-ANIMATION)
// =========================================================
interface AnimatedPressableCardProps {
  onPress: () => void;
  accessibilityLabel: string;
  style?: any;
  children: React.ReactNode;
}

const AnimatedPressableCard: React.FC<AnimatedPressableCardProps> = ({
  onPress,
  accessibilityLabel,
  style,
  children,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

// =========================================================
// HOME SCREEN IMPLEMENTATION
// =========================================================
export default function HomeTab() {
  const { theme } = useAppTheme();
  const { t } = useLocalization();
  const { isTabletOrFoldable } = useResponsive();
  const { items: historyItems } = useHistory();
  const { favorites } = useFavorites();
  const { history: generatedItems } = useGenerator();
  const styles = useMemo(() => createStyles(theme, isTabletOrFoldable), [theme, isTabletOrFoldable]);

  // Static UI Data Models (Zero Business Logic / Placeholders Only)
  const quickActions = useMemo(() => [
    { id: 'scan-qr', title: t('btn_live_scan', 'Scan QR'), subtitle: 'Instant camera capture', icon: 'qr' as const, route: '/(screens)/scanner' },
    { id: 'generate', title: t('btn_qr_studio', 'Generate QR'), subtitle: 'Custom code studio', icon: 'generator' as const, route: '/(tabs)/generate' },
    { id: 'gallery', title: t('btn_gallery_scan', 'Scan Gallery'), subtitle: 'Decode image files', icon: 'gallery' as const, route: '/(screens)/gallery-scanner' },
    { id: 'favorites', title: t('favorites_vault', 'Favorites'), subtitle: 'Saved discovery list', icon: 'favorite' as const, route: '/(screens)/favorites' },
  ], [t]);

  const recentActivities = useMemo(() => {
    const merged: Array<{ id: string; title: string; subtitle: string; time: string; timestamp: number; icon: any; routeParams?: any }> = [];

    historyItems.forEach((item, index) => {
      const ts = item.timestamp || 0;
      const d = new Date(ts || Date.now());
      const diffMin = Math.round((Date.now() - ts) / 60000);
      let timeStr = `${d.toLocaleDateString()}`;
      if (diffMin < 60) timeStr = `${Math.max(1, diffMin)}m ago`;
      else if (diffMin < 1440) timeStr = `${Math.round(diffMin / 60)}h ago`;

      let icon: any = item.isQR !== false ? 'qr' : 'barcode';
      if ((item.symbology || '').toUpperCase().includes('WIFI')) icon = 'wifi';
      else if ((item.rawValue || '').startsWith('http')) icon = 'url';

      merged.push({
        id: `hist_${item.id}_${index}`,
        title: item.displayTitle || item.rawValue || 'Unknown Scan',
        subtitle: `${item.symbology || (item.isQR !== false ? 'QR Code' : 'Barcode')} • Optical Capture`,
        time: timeStr,
        timestamp: ts,
        icon,
        routeParams: {
          id: item.id,
          rawValue: item.rawValue,
          displayTitle: item.displayTitle,
          symbology: item.symbology,
          isQR: item.isQR !== false ? 'true' : 'false',
        },
      });
    });

    generatedItems.forEach((gen, index) => {
      const ts = gen.timestamp || 0;
      const d = new Date(ts || Date.now());
      const diffMin = Math.round((Date.now() - ts) / 60000);
      let timeStr = `${d.toLocaleDateString()}`;
      if (diffMin < 60) timeStr = `${Math.max(1, diffMin)}m ago`;
      else if (diffMin < 1440) timeStr = `${Math.round(diffMin / 60)}h ago`;

      merged.push({
        id: `gen_${gen.id}_${index}`,
        title: gen.data?.title || gen.data?.payload || 'Custom QR Matrix',
        subtitle: `${gen.data?.type || 'QR Code'} • Generated Studio`,
        time: timeStr,
        timestamp: ts,
        icon: 'generator',
        routeParams: {
          id: gen.id,
          rawValue: gen.data?.payload,
          displayTitle: gen.data?.title,
          symbology: gen.data?.type,
          isQR: 'true',
        },
      });
    });

    merged.sort((a, b) => b.timestamp - a.timestamp);
    return merged.slice(0, 3);
  }, [historyItems, generatedItems]);

  const statsData = useMemo(() => {
    const totalScans = historyItems.length;
    const totalFavs = favorites.length;
    const totalGen = generatedItems.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthScans = historyItems.filter((item) => (item.timestamp || 0) >= startOfMonth).length;
    const monthGen = generatedItems.filter((item) => (item.timestamp || 0) >= startOfMonth).length;
    const thisMonth = monthScans + monthGen;

    return [
      { label: 'Total Scans', value: totalScans.toLocaleString(), icon: 'chart' as const, color: theme.customColors.primary },
      { label: 'Favorites', value: totalFavs.toLocaleString(), icon: 'favoriteFilled' as const, color: theme.customColors.error },
      { label: 'Generated QR', value: totalGen.toLocaleString(), icon: 'generator' as const, color: theme.customColors.success },
      { label: 'This Month', value: thisMonth.toLocaleString(), icon: 'calendar' as const, color: theme.customColors.warning },
    ];
  }, [theme, historyItems, favorites, generatedItems]);

  const featureHighlights = useMemo(() => [
    { title: 'Offline First', description: 'Zero cloud server dependency', icon: 'offline' as const },
    { title: 'Blazing Fast', description: 'Instant pattern decoding', icon: 'fast' as const },
    { title: '100% Private', description: 'No telemetry or ad tracking', icon: 'privacy' as const },
    { title: 'Secure Engine', description: 'MMKV hardware-encrypted state', icon: 'secure' as const },
  ], []);

  return (
    <ScreenContainer scrollable withSafeArea testID="home-tab-screen">
      <View style={styles.container}>
        {/* =========================================================
            SECTION 1: GREETING HEADER
           ========================================================= */}
        <View style={styles.sectionHeader}>
          <View style={styles.headerTextContainer}>
            <Text style={[theme.typography.labelMedium, styles.greetingSubtext]}>
              GOOD MORNING 👋
            </Text>
            <Text style={[theme.typography.headlineLarge, styles.greetingTitle]}>
              Pro Explorer
            </Text>
            <Text style={[theme.typography.bodySmall, styles.userTierText]}>
              Material 3 Spatial Hub Enabled
            </Text>
          </View>

          <View style={styles.headerActionIcons}>
            <IconButton
              icon="bell"
              size={22}
              onPress={() => router.push('/(screens)/help-support')}
              style={styles.headerIconButton}
              accessibilityLabel="View Notifications & Updates"
            />
            <View style={styles.headerIconSpacer} />
            <IconButton
              icon="settings"
              size={22}
              onPress={() => router.push('/(tabs)/settings')}
              style={styles.headerIconButton}
              accessibilityLabel="Open Application Settings"
            />
          </View>
        </View>

        {/* =========================================================
            SECTION 2: LARGE HERO CARD
           ========================================================= */}
        <View style={styles.sectionMargin}>
          <Card variant="elevated" elevationLevel={4} style={styles.heroCard}>
            <View style={styles.heroCardContent}>
              <View style={styles.heroTextSection}>
                <Tag label="M3 OPTICAL ENGINE" variant="info" dot style={styles.heroTag} />
                <Text style={[theme.typography.headlineMedium, styles.heroTitle]}>
                  {t('app_title', 'QuickScan')} - {t('btn_live_scan', 'Scan QR & Barcode')}
                </Text>
                <Text style={[theme.typography.bodyMedium, styles.heroSubtitle]}>
                  {t('home_subtitle', 'Instantaneous precision scanning engineered for maximum accuracy and absolute privacy.')}
                </Text>
              </View>

              <View style={styles.heroIllustration}>
                <View style={styles.heroIconCircleOuter}>
                  <View style={styles.heroIconCircleInner}>
                    <Icon name="qr" size={44} color={theme.customColors.primary} />
                  </View>
                  <View style={styles.heroSecondaryBadge}>
                    <Icon name="barcode" size={18} color={theme.customColors.surface} />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.heroButtonRow}>
              <View style={styles.heroPrimaryButtonWrap}>
                <PremiumButton
                  title={t('btn_live_scan', 'Launch Scanner')}
                  icon="camera"
                  onPress={() => router.push('/(screens)/scanner')}
                  fullWidth
                  accessibilityLabel="Launch Optical QR and Barcode Scanner"
                  testID="btn-hero-scan"
                />
              </View>
              <View style={styles.heroButtonSpacer} />
              <View style={styles.heroSecondaryButtonWrap}>
                <OutlineButton
                  title="Options"
                  icon="more"
                  onPress={() => router.push('/(screens)/search')}
                  fullWidth
                  accessibilityLabel="Open Secondary Scan Options and Database"
                  testID="btn-hero-options"
                />
              </View>
            </View>
          </Card>
        </View>

        {/* =========================================================
            SECTION 3: QUICK ACTIONS (2-COLUMN GRID)
           ========================================================= */}
        <View style={styles.sectionMargin}>
          <View style={styles.sectionTitleRow}>
            <Text style={[theme.typography.titleLarge, styles.sectionTitleText]}>
              {t('quick_actions', 'Quick Actions')}
            </Text>
            <Tag label="2X2 M3 GRID" variant="default" />
          </View>

          <View style={styles.quickActionsGrid}>
            {quickActions.map((item) => (
              <AnimatedPressableCard
                key={item.id}
                onPress={() => router.push(item.route as any)}
                accessibilityLabel={`${item.title}, ${item.subtitle}`}
                style={styles.quickActionCardContainer}
              >
                <Card variant="filled" style={styles.quickActionCard}>
                  <View style={styles.quickActionHeaderRow}>
                    <View style={styles.quickActionIconBox}>
                      <Icon name={item.icon} size={26} color={theme.customColors.primary} />
                    </View>
                    <Icon name="arrowRight" size={20} color={theme.customColors.textDisabled} />
                  </View>
                  <Text style={[theme.typography.titleMedium, styles.quickActionTitle]}>
                    {item.title}
                  </Text>
                  <Text style={[theme.typography.bodySmall, styles.quickActionSubtitle]} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </Card>
              </AnimatedPressableCard>
            ))}
          </View>
        </View>

        {/* =========================================================
            SECTION 4: RECENT ACTIVITY
           ========================================================= */}
        <View style={styles.sectionMargin}>
          <View style={styles.sectionTitleRow}>
            <Text style={[theme.typography.titleLarge, styles.sectionTitleText]}>
              {t('recent_scans', 'Recent Activity')}
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/history')}
              style={styles.viewAllButton}
              accessibilityLabel="View all history archives"
              accessibilityRole="button"
            >
              <Text style={[theme.typography.labelLarge, styles.viewAllText]}>
                View All
              </Text>
              <Icon name="chevronRight" size={18} color={theme.customColors.primary} />
            </Pressable>
          </View>

          <Card variant="elevated" elevationLevel={1} style={styles.activityListCard}>
            {recentActivities.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Icon name="history" size={32} color={theme.customColors.textDisabled} style={{ marginBottom: 8 }} />
                <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, textAlign: 'center', fontWeight: '700' }]}>
                  No Recent Activity Yet
                </Text>
                <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
                  Your scanned codes and generated QR matrices will automatically appear here.
                </Text>
              </View>
            ) : (
              recentActivities.map((activity, idx) => (
                <React.Fragment key={`${activity.id}_${idx}`}>
                  <AnimatedPressableCard
                    onPress={() => {
                      if (activity.routeParams) {
                        router.push({ pathname: '/(screens)/scan-result', params: activity.routeParams });
                      } else {
                        router.push('/(screens)/scan-result');
                      }
                    }}
                    accessibilityLabel={`Recent item: ${activity.title}, ${activity.subtitle}, scanned ${activity.time}`}
                    style={styles.activityItemContainer}
                  >
                    <View style={styles.activityRow}>
                      <View style={styles.activityIconCircle}>
                        <Icon name={activity.icon} size={22} color={theme.customColors.primary} />
                      </View>

                      <View style={styles.activityTextWrap}>
                        <Text style={[theme.typography.titleSmall, styles.activityTitle]} numberOfLines={1}>
                          {activity.title}
                        </Text>
                        <Text style={[theme.typography.bodySmall, styles.activitySubtitle]} numberOfLines={1}>
                          {activity.subtitle}
                        </Text>
                      </View>

                      <View style={styles.activityTimeWrap}>
                        <View style={styles.activityTimeBadge}>
                          <Icon name="clock" size={12} color={theme.customColors.textSecondary} style={styles.timeIcon} />
                          <Text style={[theme.typography.labelSmall, styles.activityTimeText]}>
                            {activity.time}
                          </Text>
                        </View>
                        <Icon name="chevronRight" size={20} color={theme.customColors.textDisabled} />
                      </View>
                    </View>
                  </AnimatedPressableCard>
                  {idx < recentActivities.length - 1 && <View style={styles.itemDivider} />}
                </React.Fragment>
              ))
            )}
          </Card>
        </View>

        {/* =========================================================
            SECTION 5: STATISTICS & INSIGHTS (2X2 GRID)
           ========================================================= */}
        <View style={styles.sectionMargin}>
          <Text style={[theme.typography.titleLarge, styles.sectionTitleText, styles.sectionTitleStandalone]}>
            Statistics & Insights
          </Text>
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => (
              <View key={index} style={styles.statCardContainer}>
                <Card variant="filled" style={styles.statCard}>
                  <View style={[styles.statIconBadge, { backgroundColor: `${stat.color}15` }]}>
                    <Icon name={stat.icon} size={22} color={stat.color} />
                  </View>
                  <Text style={[theme.typography.headlineSmall, styles.statValueText]}>
                    {stat.value}
                  </Text>
                  <Text style={[theme.typography.labelMedium, styles.statLabelText]}>
                    {stat.label}
                  </Text>
                </Card>
              </View>
            ))}
          </View>
        </View>

        {/* =========================================================
            SECTION 6: TIPS CARD
           ========================================================= */}
        <View style={styles.sectionMargin}>
          <Card variant="filled" style={styles.tipsCard}>
            <View style={styles.tipsRow}>
              <View style={styles.tipsIconBox}>
                <Icon name="lightbulb" size={28} color={theme.customColors.warning} />
              </View>
              <View style={styles.tipsContent}>
                <View style={styles.tipsTitleRow}>
                  <Text style={[theme.typography.titleSmall, styles.tipsTitle]}>
                    Pro Scanner Tip
                  </Text>
                  <Icon name="sparkles" size={16} color={theme.customColors.warning} />
                </View>
                <Text style={[theme.typography.bodySmall, styles.tipsText]}>
                  Scan QR codes in good lighting for better accuracy and instantaneous sub-millisecond recognition.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* =========================================================
            SECTION 7: FEATURE HIGHLIGHTS (HORIZONTAL SCROLL)
           ========================================================= */}
        <View style={styles.sectionMargin}>
          <Text style={[theme.typography.titleLarge, styles.sectionTitleText, styles.sectionTitleStandalone]}>
            Feature Highlights
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.highlightsScrollContainer}
          >
            {featureHighlights.map((feat, idx) => (
              <Card key={idx} variant="elevated" elevationLevel={1} style={styles.highlightCard}>
                <View style={styles.highlightHeader}>
                  <View style={styles.highlightIconContainer}>
                    <Icon name={feat.icon} size={24} color={theme.customColors.primary} />
                  </View>
                  <Tag label="PRO M3" variant="info" />
                </View>
                <Text style={[theme.typography.titleMedium, styles.highlightTitle]}>
                  {feat.title}
                </Text>
                <Text style={[theme.typography.bodySmall, styles.highlightDesc]}>
                  {feat.description}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* =========================================================
            SECTION 8: PREMIUM FOOTER
           ========================================================= */}
        <View style={styles.footerSection}>
          <View style={styles.footerLogoWrap}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.footerLogo}
              contentFit="contain"
              accessibilityLabel="Quick Scan Tiny Footer Emblem"
            />
          </View>
          <Text style={[theme.typography.labelLarge, styles.footerAppName]}>
            Quick Scan
          </Text>
          <Text style={[theme.typography.bodySmall, styles.footerVersion]}>
            Version 1.0.0
          </Text>
          <View style={styles.copyrightRow}>
            <Icon name="copyright" size={14} color={theme.customColors.textDisabled} />
            <Text style={[theme.typography.labelSmall, styles.footerCopyrightText]}>
              2026 Quick Scan. All Rights Reserved.
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

// =========================================================
// STRICT DYNAMIC STYLE GENERATOR (ZERO INLINE OR MAGIC NUMBERS)
// =========================================================
const createStyles = (theme: AppTheme, isTabletOrFoldable: boolean) =>
  StyleSheet.create({
    container: {
      paddingVertical: theme.spacing[16],
    },
    // Section 1: Header Styles
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing[12],
    },
    headerTextContainer: {
      flex: 1,
      marginRight: theme.spacing[24],
    },
    greetingSubtext: {
      color: theme.customColors.primary,
      fontWeight: '700',
      letterSpacing: 1.1,
      marginBottom: theme.spacing[4],
    },
    greetingTitle: {
      color: theme.customColors.textPrimary,
      fontWeight: '800',
      marginBottom: 2,
    },
    userTierText: {
      color: theme.customColors.textSecondary,
    },
    headerActionIcons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerIconButton: {
      backgroundColor: theme.customColors.surfaceVariant,
      borderRadius: theme.radius[16],
      width: 48,
      height: 48,
    },
    headerIconSpacer: {
      width: theme.spacing[8],
    },
    // Common Section Utilities
    sectionMargin: {
      marginBottom: theme.spacing[32],
    },
    sectionTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing[16],
    },
    sectionTitleText: {
      color: theme.customColors.textPrimary,
      fontWeight: '700',
    },
    sectionTitleStandalone: {
      marginBottom: theme.spacing[16],
    },
    // Section 2: Hero Card Styles
    heroCard: {
      backgroundColor: theme.customColors.primaryContainer,
      padding: theme.spacing[20],
      borderRadius: theme.radius[24],
    },
    heroCardContent: {
      flexDirection: isTabletOrFoldable ? 'row' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing[20],
    },
    heroTextSection: {
      flex: 1,
      marginRight: theme.spacing[16],
    },
    heroTag: {
      alignSelf: 'flex-start',
      marginBottom: theme.spacing[12],
    },
    heroTitle: {
      color: theme.customColors.textPrimary,
      fontWeight: '800',
      marginBottom: theme.spacing[8],
    },
    heroSubtitle: {
      color: theme.customColors.textSecondary,
      lineHeight: 22,
    },
    heroIllustration: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroIconCircleOuter: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: theme.customColors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.elevation.level2,
    },
    heroIconCircleInner: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: theme.customColors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroSecondaryBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.customColors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.customColors.surface,
    },
    heroButtonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    heroPrimaryButtonWrap: {
      flex: 1.6,
    },
    heroButtonSpacer: {
      width: theme.spacing[12],
    },
    heroSecondaryButtonWrap: {
      flex: 1,
    },
    // Section 3: Quick Actions 2-Column Grid
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    quickActionCardContainer: {
      width: isTabletOrFoldable ? '23.5%' : '47.5%',
      marginBottom: theme.spacing[16],
    },
    quickActionCard: {
      backgroundColor: theme.customColors.surfaceVariant,
      padding: theme.spacing[16],
      borderRadius: theme.radius[20],
      height: 142,
      justifyContent: 'space-between',
    },
    quickActionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    quickActionIconBox: {
      width: 44,
      height: 44,
      borderRadius: theme.radius[12],
      backgroundColor: theme.customColors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quickActionTitle: {
      color: theme.customColors.textPrimary,
      fontWeight: '700',
      marginTop: theme.spacing[8],
    },
    quickActionSubtitle: {
      color: theme.customColors.textSecondary,
    },
    // Section 4: Recent Activity Styles
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[4],
      paddingHorizontal: theme.spacing[8],
    },
    viewAllText: {
      color: theme.customColors.primary,
      fontWeight: '700',
      marginRight: 4,
    },
    activityListCard: {
      backgroundColor: theme.customColors.surface,
      borderRadius: theme.radius[20],
      paddingVertical: theme.spacing[8],
      paddingHorizontal: theme.spacing[12],
    },
    activityItemContainer: {
      width: '100%',
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[12],
      paddingHorizontal: theme.spacing[4],
      minHeight: 64,
    },
    activityIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.customColors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing[12],
    },
    activityTextWrap: {
      flex: 1,
      marginRight: theme.spacing[8],
    },
    activityTitle: {
      color: theme.customColors.textPrimary,
      fontWeight: '700',
      marginBottom: 2,
    },
    activitySubtitle: {
      color: theme.customColors.textSecondary,
    },
    activityTimeWrap: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    activityTimeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.customColors.surfaceVariant,
      paddingHorizontal: theme.spacing[8],
      paddingVertical: theme.spacing[4],
      borderRadius: theme.radius[8],
      marginRight: theme.spacing[4],
    },
    timeIcon: {
      marginRight: 4,
    },
    activityTimeText: {
      color: theme.customColors.textSecondary,
    },
    itemDivider: {
      height: 1,
      backgroundColor: theme.customColors.divider,
      marginHorizontal: theme.spacing[8],
    },
    // Section 5: Statistics 2x2 Grid
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCardContainer: {
      width: isTabletOrFoldable ? '23.5%' : '47.5%',
      marginBottom: theme.spacing[16],
    },
    statCard: {
      backgroundColor: theme.customColors.surfaceVariant,
      padding: theme.spacing[16],
      borderRadius: theme.radius[20],
      width: '100%',
      alignItems: 'flex-start',
    },
    statIconBadge: {
      width: 42,
      height: 42,
      borderRadius: theme.radius[12],
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing[12],
    },
    statValueText: {
      color: theme.customColors.textPrimary,
      fontWeight: '800',
      marginBottom: 2,
    },
    statLabelText: {
      color: theme.customColors.textSecondary,
    },
    // Section 6: Tips Card
    tipsCard: {
      backgroundColor: `${theme.customColors.warning}10`,
      borderWidth: 1,
      borderColor: `${theme.customColors.warning}40`,
      borderRadius: theme.radius[20],
      padding: theme.spacing[16],
    },
    tipsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    tipsIconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.customColors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing[12],
    },
    tipsContent: {
      flex: 1,
    },
    tipsTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing[4],
      gap: 6 as unknown as number,
    },
    tipsTitle: {
      color: theme.customColors.textPrimary,
      fontWeight: '700',
    },
    tipsText: {
      color: theme.customColors.textSecondary,
      lineHeight: 20,
    },
    // Section 7: Feature Highlights
    highlightsScrollContainer: {
      paddingRight: theme.spacing[16],
      gap: theme.spacing[6] as unknown as number,
    },
    highlightCard: {
      backgroundColor: theme.customColors.surface,
      padding: theme.spacing[16],
      borderRadius: theme.radius[20],
      width: 200,
      marginRight: theme.spacing[16],
    },
    highlightHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing[12],
    },
    highlightIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.customColors.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    highlightTitle: {
      color: theme.customColors.textPrimary,
      fontWeight: '700',
      marginBottom: theme.spacing[4],
    },
    highlightDesc: {
      color: theme.customColors.textSecondary,
      lineHeight: 18,
    },
    // Section 8: Premium Footer
    footerSection: {
      alignItems: 'center',
      paddingTop: theme.spacing[32],
      paddingBottom: theme.spacing[80],
    },
    footerLogoWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.customColors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing[12],
    },
    footerLogo: {
      width: 26,
      height: 26,
    },
    footerAppName: {
      color: theme.customColors.textPrimary,
      fontWeight: '700',
      marginBottom: 2,
    },
    footerVersion: {
      color: theme.customColors.textSecondary,
      marginBottom: theme.spacing[8],
    },
    copyrightRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4 as unknown as number,
    },
    footerCopyrightText: {
      color: theme.customColors.textDisabled,
    },
  });
