import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAppTheme, useScanner, useFavorites } from '../../hooks';
import { ScanResultFactory, StandardScanResult } from '../../features/scanner';
import { ClipboardService } from '../../services/ClipboardService';
import { ShareService } from '../../services/ShareService';
import { AdService } from '../../features/ads/AdService';
import { useResponsive } from '../../utils/responsive';
import {
  ScreenContainer,
  AppHeader,
  SectionCard,
  Card,
  PremiumButton,
  OutlineButton,
  IconButton,
  Icon,
  Tag,
  Divider,
  Chip,
  BottomSheet,
  ListItem,
  ErrorView,
  EmptyState,
} from '../../components';
import { IconName, icons } from '../../theme/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// --- Types & Placeholder Data ---
interface ResultTypeData {
  id: string;
  label: string;
  category: string;
  payload: string;
  icon: keyof typeof icons | IconName;
  accentVariant: 'primary' | 'success' | 'warning' | 'info' | 'error';
  openActionLabel: string;
  format: string;
  errorCorrection: string;
  length: string;
}



interface QuickActionTileProps {
  label: string;
  icon: keyof typeof icons | IconName;
  onPress: () => void;
  variant?: 'default' | 'primary';
}

const QuickActionTile: React.FC<QuickActionTileProps> = ({ label, icon, onPress, variant = 'default' }) => {
  const { theme } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bg = variant === 'primary' ? theme.customColors.primaryContainer : theme.customColors.surfaceVariant;
  const color = variant === 'primary' ? theme.customColors.primary : theme.customColors.textPrimary;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.96, { damping: 15, stiffness: 200 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 15, stiffness: 200 }))}
      style={[
        styles.gridTile,
        {
          backgroundColor: bg,
          borderRadius: theme.radius[16],
          padding: theme.spacing[16],
          borderColor: theme.customColors.divider,
          borderWidth: StyleSheet.hairlineWidth,
        },
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.tileIconWrap, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[12] }]}>
        <Icon name={icon} size={24} color={theme.customColors.primary} />
      </View>
      <Text style={[theme.typography.labelMedium, { color, marginTop: theme.spacing[12], fontWeight: '600' }]} numberOfLines={1}>
        {label}
      </Text>
    </AnimatedPressable>
  );
};

export default function ScanResultScreen() {
  const { theme } = useAppTheme();
  const { isTabletOrFoldable } = useResponsive();
  const { lastScan } = useScanner();
  const params = useLocalSearchParams<{ id?: string; rawValue?: string; symbology?: string; displayTitle?: string; isQR?: string; timestamp?: string }>();

  useEffect(() => {
    AdService.getInstance().onScanResultViewed();
  }, []);

  const liveResultData: ResultTypeData | null = useMemo(() => {
    const raw = params.rawValue || lastScan?.rawValue;
    const sym = (params.symbology || lastScan?.symbology || 'TEXT') as string;
    const isQR = params.isQR ? params.isQR === 'true' : (lastScan?.isQR ?? true);

    if (!raw) return null;

    const parsed = ScanResultFactory.processResult(raw, isQR ? 'qr' : 'ean13');
    const firstAction = parsed.actions.find((a) => a.isPrimary) || parsed.actions[0];
    let icon: keyof typeof icons | IconName = isQR ? 'qr' : 'barcode';
    let variant: 'primary' | 'success' | 'warning' | 'info' | 'error' = 'primary';
    let actionLabel = firstAction ? firstAction.label : 'Copy Payload Data';

    if (parsed.contentType === 'WEBSITE') { icon = 'url'; variant = 'primary'; }
    else if (parsed.contentType === 'WIFI') { icon = 'wifi'; variant = 'info'; }
    else if (parsed.contentType === 'EMAIL') { icon = 'email'; variant = 'success'; }
    else if (parsed.contentType === 'PHONE') { icon = 'phone'; variant = 'success'; }
    else if (parsed.contentType === 'SMS') { icon = 'sms'; variant = 'info'; }
    else if (parsed.contentType === 'VCARD') { icon = 'contact'; variant = 'primary'; }
    else if (parsed.contentType === 'GEO' || parsed.contentType === 'GOOGLE_MAPS') { icon = 'location'; variant = 'warning'; }
    else if (parsed.contentType === 'CALENDAR') { icon = 'calendar'; variant = 'primary'; }
    else if (parsed.contentType === 'WHATSAPP') { icon = 'whatsapp'; variant = 'success'; }
    else if (parsed.contentType === 'PLAIN_TEXT') { icon = 'text'; variant = 'primary'; }
    else if (parsed.contentType === 'BARCODE') { icon = 'barcode'; variant = 'warning'; }

    return {
      id: params.id || lastScan?.id || `scan_${Date.now()}`,
      label: parsed.displayTitle,
      category: isQR ? `QR_CODE (${parsed.contentType})` : `BARCODE (${parsed.contentType})`,
      payload: raw,
      icon,
      accentVariant: variant,
      openActionLabel: actionLabel,
      format: isQR ? 'ISO/IEC 18004 Optical Matrix' : `Standard Universal ${sym}`,
      errorCorrection: isQR ? 'Hardware Verified Redundancy' : 'Checksum Parity Validated',
      length: `${raw.length} Bytes (${raw.length * 8} bits)`,
    };
  }, [params, lastScan]);

  const [uiState, setUiState] = useState<'success' | 'error' | 'empty'>('success');
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { toggleFavorite, isFavoriteScan } = useFavorites();

  const activeResult = liveResultData;

  useEffect(() => {
    if (activeResult) {
      setIsFavorited(isFavoriteScan(activeResult.id));
    }
  }, [isFavoriteScan, activeResult?.id]);

  const handleToggleFavorite = () => {
    if (!activeResult) return;
    const nextVal = !isFavorited;
    setIsFavorited(nextVal);
    toggleFavorite({
      id: activeResult.id,
      rawValue: activeResult.payload,
      displayTitle: activeResult.label || 'Scanned Item',
      symbology: activeResult.id === 'barcode' || activeResult.category.includes('BARCODE') ? 'EAN_13' : 'QR',
      isQR: !(activeResult.id === 'barcode' || activeResult.category.includes('BARCODE')),
      timestamp: Date.now(),
    }, activeResult.label).catch((e) => console.error('Failed to save to favorites:', e));
    showDemoToast(nextVal ? 'Saved to favorites' : 'Removed from favorites');
  };

  // Phase 14: Automated Scan Result Processing Engine Execution
  const parsedResult: StandardScanResult = useMemo(() => {
    if (!activeResult) {
      return { contentType: 'UNKNOWN', displayTitle: '', actions: [], rawValue: '', format: 'qr' } as unknown as StandardScanResult;
    }
    return ScanResultFactory.processResult(
      activeResult.payload,
      activeResult.id === 'barcode' || activeResult.category.includes('BARCODE') ? 'ean13' : 'qr'
    );
  }, [activeResult]);

  const primaryMappedAction = useMemo(() => {
    if (!activeResult) {
      return { label: 'Copy Payload', icon: 'externalLink' as const, id: 'default_open', type: 'COPY' as const };
    }
    return parsedResult.actions.find((a) => a.isPrimary) || {
      label: activeResult.openActionLabel,
      icon: 'externalLink' as const,
      id: 'default_open',
      type: 'COPY',
    };
  }, [parsedResult, activeResult]);

  // Reanimated Success Badge Scaling
  const badgeScale = useSharedValue(0.8);
  const badgeOpacity = useSharedValue(0);

  useEffect(() => {
    badgeScale.value = withSpring(1, { damping: 12, stiffness: 150 });
    badgeOpacity.value = withTiming(1, { duration: 300 });
  }, [uiState, badgeScale, badgeOpacity]);

  const successBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
    opacity: badgeOpacity.value,
  }));

  const showDemoToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePrimaryOperation = async () => {
    if (!activeResult) return;
    const payload = activeResult.payload;
    try {
      if (payload.startsWith('http://') || payload.startsWith('https://') || payload.startsWith('mailto:') || payload.startsWith('tel:') || payload.startsWith('sms:') || payload.startsWith('geo:') || payload.startsWith('whatsapp:') || payload.startsWith('upi://')) {
        const canOpen = await Linking.canOpenURL(payload);
        if (canOpen) {
          await Linking.openURL(payload);
          return;
        }
      }
    } catch {
      // Ignore link open exceptions
    }
    if ((primaryMappedAction as any).type === 'SHARE') {
      ShareService.getInstance().shareText(payload, activeResult.label);
    } else {
      ClipboardService.getInstance().copyToClipboard(payload);
      showDemoToast('📋 Decoded payload copied to device clipboard!');
    }
  };

  // Render Empty State UI
  if (uiState === 'empty' || !activeResult) {
    return (
      <ScreenContainer scrollable withSafeArea testID="scan-result-empty-screen">
        <AppHeader title="Scan Discovery" subtitle="Memory Vault" showBack={true} />
        <View style={{ flex: 1, minHeight: 400, justifyContent: 'center', marginTop: theme.spacing[24] }}>
          <EmptyState
            icon="empty"
            title="No Scan Records Active"
            description="Your recent optical capture buffer is currently empty. Start scanning QR matrices or import barcodes from your photo roll to populate discovery analytics."
            actionLabel="Launch Live Scanner"
            onActionPress={() => router.push('/(screens)/scanner' as any)}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable withSafeArea testID="scan-result-premium-screen">
      {/* 1. Header with History Button & More Menu */}
      <AppHeader
        title="Scan Discovery"
        subtitle="Decoded Payload Overview"
        showBack={true}
        showMore={true}
        onMore={() => setBottomSheetVisible(true)}
        rightElement={
          <IconButton
            icon="history"
            size={22}
            onPress={() => router.push('/(tabs)/history' as any)}
            accessibilityLabel="View local scan history"
            style={{ marginRight: theme.spacing[4] }}
          />
        }
      />

      {toastMessage && (
        <View
          style={{
            backgroundColor: `${theme.customColors.primary}20`,
            borderColor: theme.customColors.primary,
            borderWidth: 1,
            borderRadius: theme.radius[16],
            paddingHorizontal: theme.spacing[16],
            paddingVertical: theme.spacing[12],
            marginTop: theme.spacing[12],
          }}
        >
          <Text style={[theme.typography.bodySmall, { color: theme.customColors.textPrimary, fontWeight: '700', textAlign: 'center' }]}>
            {toastMessage}
          </Text>
        </View>
      )}

      <View style={{ marginTop: theme.spacing[16] }}>
        {/* 2. Success Animation Section */}
        <Animated.View style={[styles.successHeroContainer, successBadgeStyle]}>
          <View
            style={[
              styles.successCircleOuter,
              {
                backgroundColor: theme.customColors.primaryContainer,
                borderColor: theme.customColors.primary,
                borderRadius: theme.radius[32],
              },
            ]}
          >
            <View style={[styles.successCircleInner, { backgroundColor: theme.customColors.primary }]}>
              <Icon name="check" size={40} color="#FFFFFF" />
            </View>
          </View>
          <Text style={[theme.typography.titleLarge, { color: theme.customColors.textPrimary, marginTop: theme.spacing[12] }]}>
            {activeResult.label} Decoded Successfully
          </Text>
          <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary }]}>
            Instant optical memory verification complete
          </Text>
        </Animated.View>

        <View style={{ height: theme.spacing[16] }} />

        {/* 3. Result Type Card (Large Premium Card) */}
        <Card
          variant="elevated"
          elevationLevel={3}
          style={[styles.mainResultCard, { backgroundColor: theme.customColors.surface, borderRadius: theme.radius[24] }]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.typeIconBox, { backgroundColor: theme.customColors.surfaceVariant, borderRadius: theme.radius[16] }]}>
              <Icon name={activeResult.icon} size={32} color={theme.customColors.primary} />
            </View>
            <View style={styles.cardMetaText}>
              <Tag label={activeResult.category} variant="success" dot />
              <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, marginTop: 4 }]}>
                Captured May 18 • 14:32 PM
              </Text>
            </View>
            <IconButton
              icon={isFavorited ? 'favoriteFilled' : 'favorite'}
              size={26}
              color={isFavorited ? theme.customColors.warning : theme.customColors.textSecondary}
              onPress={handleToggleFavorite}
              accessibilityLabel="Toggle bookmark status"
            />
          </View>

          <Divider marginVertical={theme.spacing[16]} />

          <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary }]}>DECODED PAYLOAD VALUE</Text>
          <View
            style={[
              styles.payloadContentBox,
              {
                backgroundColor: theme.customColors.surfaceVariant,
                borderRadius: theme.radius[16],
                padding: theme.spacing[16],
                marginTop: theme.spacing[8],
                borderWidth: StyleSheet.hairlineWidth,
                borderColor: theme.customColors.divider,
              },
            ]}
          >
            <Text
              style={[
                theme.typography.titleMedium,
                { color: theme.customColors.textPrimary, fontWeight: '700', lineHeight: 24 },
              ]}
              selectable
            >
              {activeResult.payload}
            </Text>
          </View>

          <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: theme.spacing[12] }]}>
            Format: {activeResult.format} • Detected Type: {parsedResult.displayTitle}
          </Text>
        </Card>

        <View style={{ height: theme.spacing[24] }} />

        {/* Phase 14: Extracted Structured Information Section */}
        {parsedResult.fields.length > 0 && (
          <>
            <SectionCard title="Extracted Structured Data" subtitle={parsedResult.displaySubtitle || 'Phase 14 Engine Analysis'}>
              <View style={styles.metadataGrid}>
                {parsedResult.fields.map((field, index) => (
                  <React.Fragment key={`${field.label}_${index}`}>
                    {index > 0 && <Divider marginVertical={theme.spacing[8]} />}
                    <View style={styles.metaRow}>
                      <View style={{ flex: 1, marginRight: theme.spacing[8] }}>
                        <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary }]}>
                          {field.label}
                        </Text>
                      </View>
                      <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                        <Text
                          style={[theme.typography.labelLarge, { color: theme.customColors.textPrimary, textAlign: 'right' }]}
                          selectable
                        >
                          {field.value}
                        </Text>
                      </View>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </SectionCard>
            <View style={{ height: theme.spacing[24] }} />
          </>
        )}

        {/* 4. Primary Actions Section (Mapped Actions - Execution scheduled for Phase 15) */}
        <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, marginBottom: theme.spacing[12] }]}>
          Primary Operations
        </Text>
        <PremiumButton
          title={primaryMappedAction.label}
          icon={primaryMappedAction.icon as any}
          onPress={handlePrimaryOperation}
          fullWidth
          style={{ marginBottom: theme.spacing[12], minHeight: 54 }}
        />

        <View style={styles.buttonRow3}>
          <View style={styles.buttonCol}>
            <OutlineButton
              title="Copy"
              icon="copy"
              onPress={() => {
                ClipboardService.getInstance().copyToClipboard(activeResult.payload);
                showDemoToast('📋 Decoded payload copied to clipboard!');
              }}
              fullWidth
            />
          </View>
          <View style={{ width: theme.spacing[8] }} />
          <View style={styles.buttonCol}>
            <OutlineButton
              title="Share"
              icon="share"
              onPress={() => {
                ShareService.getInstance().shareText(activeResult.payload, activeResult.label);
              }}
              fullWidth
            />
          </View>
          <View style={{ width: theme.spacing[8] }} />
          <View style={styles.buttonCol}>
            <OutlineButton
              title="Favorite"
              icon={isFavorited ? 'favoriteFilled' : 'favorite'}
              onPress={handleToggleFavorite}
              fullWidth
            />
          </View>
        </View>

        <View style={{ height: theme.spacing[24] }} />

        {/* 5. Details Card (Metadata Section) */}
        <SectionCard title="Technical Metadata" subtitle="Hardware decoding profile">
          <View style={styles.metadataGrid}>
            <View style={styles.metaRow}>
              <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary }]}>Timestamp</Text>
              <Text style={[theme.typography.labelLarge, { color: theme.customColors.textPrimary }]}>May 18, 2026 • 14:32:08</Text>
            </View>
            <Divider marginVertical={theme.spacing[8]} />
            <View style={styles.metaRow}>
              <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary }]}>Symbol Type</Text>
              <Text style={[theme.typography.labelLarge, { color: theme.customColors.textPrimary }]}>{activeResult.label} Matrix</Text>
            </View>
            <Divider marginVertical={theme.spacing[8]} />
            <View style={styles.metaRow}>
              <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary }]}>Payload Length</Text>
              <Text style={[theme.typography.labelLarge, { color: theme.customColors.textPrimary }]}>{activeResult.length}</Text>
            </View>
            <Divider marginVertical={theme.spacing[8]} />
            <View style={styles.metaRow}>
              <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary }]}>Error Parity</Text>
              <Text style={[theme.typography.labelLarge, { color: theme.customColors.textPrimary }]}>{activeResult.errorCorrection}</Text>
            </View>
            <Divider marginVertical={theme.spacing[8]} />
            <View style={styles.metaRow}>
              <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary }]}>Source Engine</Text>
              <Text style={[theme.typography.labelLarge, { color: theme.customColors.textPrimary }]}>Rear Camera Optical Sensor</Text>
            </View>
          </View>
        </SectionCard>

        <View style={{ height: theme.spacing[24] }} />

        {/* 6. Quick Action Grid (2-Column Grid) */}
        <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, marginBottom: theme.spacing[12] }]}>
          Quick Action Shortcuts
        </Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <QuickActionTile
              label="Copy Text"
              icon="copy"
              onPress={() => {
                ClipboardService.getInstance().copyToClipboard(activeResult.payload);
                showDemoToast('📋 Text copied to clipboard!');
              }}
            />
            <QuickActionTile
              label="Share Code"
              icon="share"
              onPress={() => {
                ShareService.getInstance().shareText(activeResult.payload, activeResult.label);
              }}
            />
          </View>
          <View style={[styles.gridRow, { marginTop: theme.spacing[12] }]}>
            <QuickActionTile
              label={isFavorited ? 'Favorited' : 'Favorite'}
              icon="favorite"
              onPress={handleToggleFavorite}
            />
            <QuickActionTile label="Save Archive" icon="save" onPress={() => showDemoToast('Archived record to local database')} />
          </View>
          <View style={[styles.gridRow, { marginTop: theme.spacing[12] }]}>
            <QuickActionTile
              label="Generate Again"
              icon="generator"
              variant="primary"
              onPress={() => router.push('/(screens)/qr-generator' as any)}
            />
            <QuickActionTile
              label="Scan Again"
              icon="qr"
              variant="primary"
              onPress={() => router.push('/(screens)/scanner' as any)}
            />
          </View>
        </View>

        <View style={{ height: theme.spacing[24] }} />

        {/* 7. Secondary Actions List */}
        <SectionCard title="Secondary Management" subtitle="Record governance tools">
          <View style={styles.secondaryActionsList}>
            <ListItem
              title="Generate Custom QR"
              subtitle="Encode this payload into a stylized matrix image"
              leadingIcon="generator"
              onPress={() => router.push('/(screens)/qr-generator' as any)}
            />
            <ListItem
              title="Scan Another Code"
              subtitle="Launch rear optical viewfinder immediately"
              leadingIcon="qr"
              onPress={() => router.push('/(screens)/scanner' as any)}
            />
            <ListItem
              title="Report Decoding Issue"
              subtitle="Submit feedback on inaccurate optical parsing"
              leadingIcon="report"
              onPress={() => showDemoToast('Issue report logged (UI Only)')}
            />
            <ListItem
              title="Delete Scan Record"
              subtitle="Permanently wipe entry from memory"
              leadingIcon="delete"
              onPress={() => {
                showDemoToast('Record removed');
                router.back();
              }}
            />
          </View>
        </SectionCard>

        <View style={{ height: theme.spacing[24] }} />

        {/* 8. Related Suggestions (Horizontal Cards) */}
        <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, marginBottom: theme.spacing[12] }]}>
          Related Suggestions
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsRow}
      >
        <Pressable
          onPress={() => router.push('/(screens)/qr-generator' as any)}
          style={[
            styles.suggestionCard,
            {
              backgroundColor: theme.customColors.surface,
              borderRadius: theme.radius[16],
              padding: theme.spacing[16],
              borderColor: theme.customColors.divider,
              borderWidth: StyleSheet.hairlineWidth,
              width: isTabletOrFoldable ? 240 : 180,
            },
          ]}
        >
          <Icon name="generator" size={28} color={theme.customColors.primary} />
          <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, marginTop: theme.spacing[12] }]}>
            Generate QR
          </Text>
          <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
            Create stylized matrices offline
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(tabs)/history' as any)}
          style={[
            styles.suggestionCard,
            {
              backgroundColor: theme.customColors.surface,
              borderRadius: theme.radius[16],
              padding: theme.spacing[16],
              borderColor: theme.customColors.divider,
              borderWidth: StyleSheet.hairlineWidth,
              width: isTabletOrFoldable ? 240 : 180,
              marginLeft: theme.spacing[12],
            },
          ]}
        >
          <Icon name="history" size={28} color={theme.customColors.primary} />
          <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, marginTop: theme.spacing[12] }]}>
            Open History
          </Text>
          <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
            Review locally saved scan archives
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(screens)/favorites' as any)}
          style={[
            styles.suggestionCard,
            {
              backgroundColor: theme.customColors.surface,
              borderRadius: theme.radius[16],
              padding: theme.spacing[16],
              borderColor: theme.customColors.divider,
              borderWidth: StyleSheet.hairlineWidth,
              width: isTabletOrFoldable ? 240 : 180,
              marginLeft: theme.spacing[12],
            },
          ]}
        >
          <Icon name="favorite" size={28} color={theme.customColors.primary} />
          <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, marginTop: theme.spacing[12] }]}>
            View Favorites
          </Text>
          <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
            Browse pinned & bookmarked codes
          </Text>
        </Pressable>

        <Pressable
          onPress={() => showDemoToast('Supported formats: QR, UPC-A, EAN-13, Aztec, PDF417')}
          style={[
            styles.suggestionCard,
            {
              backgroundColor: theme.customColors.surface,
              borderRadius: theme.radius[16],
              padding: theme.spacing[16],
              borderColor: theme.customColors.divider,
              borderWidth: StyleSheet.hairlineWidth,
              width: isTabletOrFoldable ? 240 : 180,
              marginLeft: theme.spacing[12],
            },
          ]}
        >
          <Icon name="learn" size={28} color={theme.customColors.primary} />
          <Text style={[theme.typography.titleSmall, { color: theme.customColors.textPrimary, marginTop: theme.spacing[12] }]}>
            Learn QR Types
          </Text>
          <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
            Explore all 10 supported data encodings
          </Text>
        </Pressable>
      </ScrollView>

      <View style={{ height: theme.spacing[48] }} />

      {/* 9. Reusable More Actions Bottom Sheet */}
      <BottomSheet
        visible={bottomSheetVisible}
        onClose={() => setBottomSheetVisible(false)}
        title="More Actions & Management"
      >
        <View style={styles.sheetContentWrap}>
          <ListItem
            title="Rename Record"
            subtitle="Customize display title for this entry"
            leadingIcon="rename"
            onPress={() => {
              setBottomSheetVisible(false);
              showDemoToast('Rename dialog opened (UI Only)');
            }}
          />
          <ListItem
            title="Export as CSV / JSON"
            subtitle="Extract structured archive file to documents"
            leadingIcon="export"
            onPress={() => {
              setBottomSheetVisible(false);
              showDemoToast('Exporting payload file... (UI Only)');
            }}
          />
          <ListItem
            title="Copy Raw Payload"
            subtitle="Duplicate unformatted bytes to clipboard"
            leadingIcon="copy"
            onPress={() => {
              setBottomSheetVisible(false);
              showDemoToast('Raw bytes copied (UI Only)');
            }}
          />
          <ListItem
            title="Share via Messenger"
            subtitle="Transmit decoded string over system share sheet"
            leadingIcon="share"
            onPress={() => {
              setBottomSheetVisible(false);
              showDemoToast('Share dialog opened (UI Only)');
            }}
          />
          <ListItem
            title="Delete from Vault"
            subtitle="Permanently remove entry from database"
            leadingIcon="delete"
            onPress={() => {
              setBottomSheetVisible(false);
              showDemoToast('Record permanently deleted');
              router.back();
            }}
          />

          <View style={{ height: theme.spacing[12] }} />

          <OutlineButton
            title="Cancel Menu"
            icon="close"
            onPress={() => setBottomSheetVisible(false)}
            fullWidth
            style={{ minHeight: 48 }}
          />
        </View>
      </BottomSheet>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statePickerRow: {
    width: '100%',
  },
  chipsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successHeroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  successCircleOuter: {
    width: 88,
    height: 88,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircleInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainResultCard: {
    width: '100%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeIconBox: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMetaText: {
    flex: 1,
    marginLeft: 12,
  },
  payloadContentBox: {
    width: '100%',
  },
  buttonRow3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonCol: {
    flex: 1,
  },
  metadataGrid: {
    width: '100%',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  gridContainer: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gridTile: {
    flex: 1,
    minHeight: 92,
    justifyContent: 'space-between',
  },
  tileIconWrap: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionsList: {
    width: '100%',
  },
  suggestionsRow: {
    flexDirection: 'row',
  },
  suggestionCard: {
    justifyContent: 'flex-start',
  },
  sheetContentWrap: {
    width: '100%',
  },
});
