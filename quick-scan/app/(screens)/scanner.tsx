import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, StatusBar, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme, useCameraLifecycle, useScannerEngine, useScanner, useSettings } from '../../hooks';
import { useResponsive } from '../../utils/responsive';
import { Logger } from '../../utils/logger';
import { Icon, Chip, Tag } from '../../components';
import { ScanResult } from '../../types/domain';
import { AppTheme } from '../../types/theme';
import { IconName, icons } from '../../theme/icons';
import { PermissionExplanationView, CameraErrorFallback, CameraErrorType } from '../../features/scanner';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// =========================================================
// INTERACTIVE SPRING TILE WRAPPER FOR BOTTOM PANEL BUTTONS
// =========================================================
interface ActionTileProps {
  title: string;
  icon: keyof typeof icons | IconName;
  active?: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: AppTheme;
}

const ActionTile: React.FC<ActionTileProps> = ({ title, icon, active, onPress, styles, theme }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.actionTileContainer, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={`Scanner quick action: ${title}`}
      accessibilityState={{ selected: active }}
    >
      <View style={[styles.actionTileIconBox, active && styles.actionTileIconBoxActive]}>
        <Icon
          name={icon}
          size={26}
          color={active ? theme.customColors.surface : theme.customColors.primary}
        />
      </View>
      <Text
        style={[
          theme.typography.labelSmall,
          styles.actionTileText,
          active && styles.actionTileTextActive,
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
    </AnimatedPressable>
  );
};

// =========================================================
// MAIN SCANNER SCREEN UI ARCHITECTURE & REAL CAMERA ENGINE
// =========================================================
export default function ScannerScreen() {
  const { theme } = useAppTheme();
  const { isTabletOrFoldable } = useResponsive();
  const width = Dimensions.get('window').width;
  const { recordScanResult } = useScanner();
  const { settings } = useSettings();

  // Responsive scan window sizing math
  const frameSize = isTabletOrFoldable ? 340 : Math.min(280, width - 64);
  const styles = useMemo(() => createStyles(theme, frameSize), [theme, frameSize]);

  // Real Hardware Camera Permissions & Lifecycle Engine
  const [permission, requestPermission] = useCameraPermissions();
  const { isCameraActive } = useCameraLifecycle();
  const [cameraError, setCameraError] = useState<CameraErrorType | null>(null);
  const [scanNotice, setScanNotice] = useState<string | null>(null);

  // 3-Way Flash Mode Toggle Synchronization ('off' | 'on' | 'auto')
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [selectedMode, setSelectedMode] = useState<'qr' | 'barcode' | 'gallery' | 'history' | 'favorites'>('qr');

  const handleFlashToggle = useCallback(() => {
    setFlashMode((prev) => {
      if (prev === 'off') return 'on';
      if (prev === 'on') return 'auto';
      return 'off';
    });
  }, []);

  const flashIcon = useMemo((): keyof typeof icons | IconName => {
    if (flashMode === 'on') return 'flashlight';
    if (flashMode === 'auto') return 'sparkles';
    return 'flashlightOff';
  }, [flashMode]);

  const flashTitle = useMemo(() => {
    if (flashMode === 'on') return 'Flash On';
    if (flashMode === 'auto') return 'Flash Auto';
    return 'Flash Off';
  }, [flashMode]);

  // Reanimated Shared Values for Google Lens style Optical & Success Animations
  const scanLineY = useSharedValue(-frameSize / 2 + 12);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.85);
  const hintFloatY = useSharedValue(0);
  const successFlash = useSharedValue(0);

  useEffect(() => {
    // 1. Continuous Oscillating Laser Scan Line
    scanLineY.value = withRepeat(
      withTiming(frameSize / 2 - 12, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );

    // 2. Breathing Glowing Accent Border Pulse
    pulseScale.value = withRepeat(
      withTiming(1.025, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    pulseOpacity.value = withRepeat(
      withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // 3. Floating Guidance Pill Bounce
    hintFloatY.value = withRepeat(
      withTiming(-4, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [frameSize, scanLineY, pulseScale, pulseOpacity, hintFloatY]);

  const animatedScanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const animatedGlowFrameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const animatedHintStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: hintFloatY.value }],
  }));

  const animatedSuccessFlashStyle = useAnimatedStyle(() => ({
    opacity: successFlash.value,
    transform: [{ scale: 1 + successFlash.value * 0.04 }],
  }));

  // --- Phase 13 Real-Time Detection & Navigation Handoff ---
  const handleScanSuccess = useCallback(
    (result: ScanResult) => {
      // Trigger Visual Success Flash Animation
      successFlash.value = withTiming(1, { duration: 140 }, () => {
        successFlash.value = withTiming(0, { duration: 350 });
      });

      // Synchronize with domain provider state and hand off to Scan Result Screen
      recordScanResult(result);
      router.push({
        pathname: '/(screens)/scan-result',
        params: {
          id: result.id,
          rawValue: result.rawValue,
          symbology: result.symbology,
          displayTitle: result.displayTitle,
          isQR: result.isQR ? 'true' : 'false',
          timestamp: result.timestamp.toString(),
        },
      });
    },
    [recordScanResult, successFlash]
  );

  const handleScanError = useCallback((errMsg: string) => {
    setScanNotice(errMsg);
    const timer = setTimeout(() => setScanNotice(null), 2500);
    return () => clearTimeout(timer);
  }, []);

  const { isScanningEnabled, supportedBarcodeTypes, handleBarcodeScanned } = useScannerEngine({
    cooldownMs: 1800,
    enableHaptics: settings.hapticFeedback ?? true,
    enableSound: settings.audioFeedback ?? false,
    onScanSuccess: handleScanSuccess,
    onScanError: handleScanError,
  });

  // Camera Authorization & Hardware Fault Branching States
  if (!permission) {
    return (
      <View style={[styles.rootContainer, styles.simulatedCameraBackground]}>
        <Icon name="viewfinder" size={80} color={`${theme.customColors.surfaceVariant}40`} />
      </View>
    );
  }

  if (!permission.granted) {
    // Show Phase 10 explanation screen before system permission prompt if undetermined or retriable
    if (permission.status === 'undetermined' || (permission.canAskAgain && permission.status !== 'denied')) {
      return (
        <View style={styles.rootContainer}>
          <StatusBar barStyle="light-content" backgroundColor={theme.customColors.background} />
          <PermissionExplanationView
            onRequestPermission={requestPermission}
            onDecline={() => router.back()}
          />
        </View>
      );
    }
    // Render Denied or Permanently Denied states with links to retry or OS Settings
    const errorType: CameraErrorType = permission.canAskAgain ? 'PERMISSION_DENIED' : 'PERMISSION_PERMANENTLY_DENIED';
    return (
      <View style={styles.rootContainer}>
        <StatusBar barStyle="light-content" backgroundColor={theme.customColors.background} />
        <CameraErrorFallback errorType={errorType} onRetry={requestPermission} />
      </View>
    );
  }

  if (cameraError) {
    return (
      <View style={styles.rootContainer}>
        <StatusBar barStyle="light-content" backgroundColor={theme.customColors.background} />
        <CameraErrorFallback errorType={cameraError} onRetry={() => setCameraError(null)} />
      </View>
    );
  }

  return (
    <View style={styles.rootContainer} testID="premium-scanner-ui-screen">
      <StatusBar barStyle="light-content" backgroundColor={theme.customColors.shadow} translucent />

      {/* =========================================================
          LAYER 1: LIVE CAMERA VIEWFINDER (OR STANDBY RELEASE)
         ========================================================= */}
      <View style={styles.simulatedCameraBackground}>
        {isCameraActive ? (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            flash={flashMode}
            enableTorch={flashMode === 'on'}
            barcodeScannerSettings={{
              barcodeTypes: supportedBarcodeTypes as any,
            }}
            onBarcodeScanned={isScanningEnabled ? handleBarcodeScanned : undefined}
            onMountError={(error) => {
              Logger.warn('ScannerScreen', 'Optical Camera Hardware Fault:', error.message);
              setCameraError('INIT_FAILURE');
            }}
          />
        ) : (
          <View style={styles.ambientSensorCenter}>
            <Icon name="viewfinder" size={140} color={`${theme.customColors.surfaceVariant}20`} />
          </View>
        )}
        {/* Subtle geometric matrix grid pattern to mimic optical sensor active state */}
        <View style={styles.gridLineHorizontal1} />
        <View style={styles.gridLineHorizontal2} />
        <View style={styles.gridLineVertical1} />
        <View style={styles.gridLineVertical2} />
      </View>

      {/* =========================================================
          LAYER 2 & 3 & 4: VIGNETTE MASKS, TOP BAR & SCAN APERTURE
         ========================================================= */}
      <View style={styles.vignetteTop}>
        {/* Transparent Top Bar with 48x48 High-Hit-Target Shortcuts */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.topBarButton}
            accessibilityRole="button"
            accessibilityLabel="Navigate back"
          >
            <Icon name="arrowBack" size={26} color={theme.customColors.surface} />
          </Pressable>

          <View style={styles.topBarActions}>
            <Pressable
              onPress={handleFlashToggle}
              style={[styles.topBarButton, flashMode !== 'off' && styles.topBarButtonActive]}
              accessibilityRole="button"
              accessibilityLabel={`Toggle camera flash icon. Current state: ${flashTitle}`}
            >
              <Icon
                name={flashIcon}
                size={24}
                color={flashMode !== 'off' ? theme.customColors.shadow : theme.customColors.surface}
              />
            </Pressable>

            <View style={styles.topBarSpacer} />

            <Pressable
              onPress={() => router.push('/(screens)/gallery-scanner')}
              style={styles.topBarButton}
              accessibilityRole="button"
              accessibilityLabel="Open photo gallery"
            >
              <Icon name="gallery" size={24} color={theme.customColors.surface} />
            </Pressable>

            <View style={styles.topBarSpacer} />

            <Pressable
              onPress={() => router.push('/(screens)/search')}
              style={styles.topBarButton}
              accessibilityRole="button"
              accessibilityLabel="Open options menu"
            >
              <Icon name="more" size={24} color={theme.customColors.surface} />
            </Pressable>
          </View>
        </View>

        {/* Optical Sensor Status Header Badge */}
        <View style={styles.sensorBadgeContainer}>
          <Tag
            label={isScanningEnabled ? "M3 OPTICAL LENS • READY" : "SCAN LOCKED • PROCESSING"}
            variant={isScanningEnabled ? "info" : "warning"}
            dot
          />
        </View>
      </View>

      {/* Center Optical Aperture Layer */}
      <View style={styles.apertureRow}>
        <View style={styles.vignetteLeft} />

        <View style={styles.scanFrameContainer}>
          {/* Breathing Glow Outer Frame */}
          <Animated.View style={[styles.glowOuterBorder, animatedGlowFrameStyle]} />

          {/* Neon Green Scan Success Flash Animation */}
          <Animated.View style={[styles.successFlashBorder, animatedSuccessFlashStyle]} />

          {/* Precision Corner Brackets */}
          <View style={[styles.bracket, styles.bracketTopLeft]} />
          <View style={[styles.bracket, styles.bracketTopRight]} />
          <View style={[styles.bracket, styles.bracketBottomLeft]} />
          <View style={[styles.bracket, styles.bracketBottomRight]} />

          {/* Continuous Oscillating Laser Scan Line */}
          <Animated.View style={[styles.laserBeamContainer, animatedScanLineStyle]}>
            <View style={styles.laserBeamGlow} />
            <View style={styles.laserBeamCore} />
          </Animated.View>

          {/* Subtle watermarked target design in center */}
          <View style={styles.targetWatermark}>
            <Icon name="scanHelper" size={56} color={`${theme.customColors.primary}30`} />
          </View>
        </View>

        <View style={styles.vignetteRight} />
      </View>

      {/* =========================================================
          LAYER 5 & 6: HINT PILL, QUICK ACTION CHIPS & BOTTOM PANEL
         ========================================================= */}
      <View style={styles.vignetteBottom}>
        {/* Floating Animated Instructional Hint Pill */}
        <Animated.View style={[styles.hintPillContainer, animatedHintStyle]}>
          <View style={[styles.hintPillBox, scanNotice ? styles.hintPillBoxError : null]}>
            <Icon
              name={scanNotice ? 'error' : 'sparkles'}
              size={18}
              color={scanNotice ? (theme.customColors.error || '#EF4444') : theme.customColors.primary}
            />
            <Text
              style={[
                theme.typography.labelMedium,
                styles.hintPillText,
                scanNotice ? { color: theme.customColors.error || '#EF4444' } : null,
              ]}
              numberOfLines={1}
            >
              {scanNotice || 'Align QR code or barcode inside frame'}
            </Text>
          </View>
        </Animated.View>

        {/* Interactive Quick Action Chips Toolbar */}
        <View style={styles.chipsToolbarWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContent}
          >
            <Chip
              label="QR Code"
              icon="qr"
              selected={selectedMode === 'qr'}
              onPress={() => setSelectedMode('qr')}
              style={styles.chipItem}
            />
            <Chip
              label="Barcode"
              icon="barcode"
              selected={selectedMode === 'barcode'}
              onPress={() => setSelectedMode('barcode')}
              style={styles.chipItem}
            />
            <Chip
              label="Gallery Import"
              icon="gallery"
              selected={selectedMode === 'gallery'}
              onPress={() => router.push('/(screens)/gallery-scanner')}
              style={styles.chipItem}
            />
            <Chip
              label="History Log"
              icon="history"
              selected={selectedMode === 'history'}
              onPress={() => router.push('/(tabs)/history')}
              style={styles.chipItem}
            />
            <Chip
              label="Favorites"
              icon="star"
              selected={selectedMode === 'favorites'}
              onPress={() => router.push('/(tabs)/favorites')}
              style={styles.chipItem}
            />
          </ScrollView>
        </View>

        {/* Material 3 Bottom Action Panel */}
        <View style={styles.bottomPanelContainer}>
          <View style={styles.panelDragHandle} />
          <View style={styles.actionGridRow}>
            <ActionTile
              title="Scan QR"
              icon="qr"
              active={selectedMode === 'qr'}
              onPress={() => setSelectedMode('qr')}
              styles={styles}
              theme={theme}
            />
            <ActionTile
              title="Barcode"
              icon="barcode"
              active={selectedMode === 'barcode'}
              onPress={() => setSelectedMode('barcode')}
              styles={styles}
              theme={theme}
            />
            <ActionTile
              title="Gallery"
              icon="gallery"
              onPress={() => router.push('/(screens)/gallery-scanner')}
              styles={styles}
              theme={theme}
            />
            <ActionTile
              title="My QR"
              icon="myQr"
              onPress={() => router.push('/(tabs)/generate')}
              styles={styles}
              theme={theme}
            />
            <ActionTile
              title={flashTitle}
              icon={flashIcon}
              active={flashMode !== 'off'}
              onPress={handleFlashToggle}
              styles={styles}
              theme={theme}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

// =========================================================
// STRICT DESIGN SYSTEM STYLESHEET (ZERO INLINE / ZERO HARDCODED)
// =========================================================
const createStyles = (theme: AppTheme, frameSize: number) =>
  StyleSheet.create({
    rootContainer: {
      flex: 1,
      backgroundColor: theme.customColors.shadow,
    },
    // Simulated / Standby Camera Viewfinder Layer
    simulatedCameraBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.customColors.background,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    gridLineHorizontal1: {
      position: 'absolute',
      top: '33%',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: `${theme.customColors.outline}15`,
    },
    gridLineHorizontal2: {
      position: 'absolute',
      top: '66%',
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: `${theme.customColors.outline}15`,
    },
    gridLineVertical1: {
      position: 'absolute',
      left: '33%',
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: `${theme.customColors.outline}15`,
    },
    gridLineVertical2: {
      position: 'absolute',
      left: '66%',
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: `${theme.customColors.outline}15`,
    },
    ambientSensorCenter: {
      opacity: 0.8,
    },
    // Vignette Surrounding Dark Alpha Masks
    vignetteTop: {
      flex: 1,
      backgroundColor: `${theme.customColors.shadow}B3`,
      paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24) + 12,
      paddingHorizontal: theme.spacing[16],
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    vignetteBottom: {
      flex: 1.3,
      backgroundColor: `${theme.customColors.shadow}B3`,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    apertureRow: {
      flexDirection: 'row',
      height: frameSize,
    },
    vignetteLeft: {
      flex: 1,
      backgroundColor: `${theme.customColors.shadow}B3`,
    },
    vignetteRight: {
      flex: 1,
      backgroundColor: `${theme.customColors.shadow}B3`,
    },
    // Transparent Top Action Bar
    topBar: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    topBarActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    topBarButton: {
      width: 48,
      height: 48,
      borderRadius: theme.radius[24],
      backgroundColor: `${theme.customColors.surfaceVariant}33`,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: `${theme.customColors.outline}33`,
    },
    topBarButtonActive: {
      backgroundColor: theme.customColors.primary,
      borderColor: theme.customColors.primary,
    },
    topBarSpacer: {
      width: theme.spacing[12],
    },
    sensorBadgeContainer: {
      marginBottom: theme.spacing[16],
    },
    // Optical Scan Aperture Window
    scanFrameContainer: {
      width: frameSize,
      height: frameSize,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    glowOuterBorder: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: theme.radius[24],
      borderWidth: 2,
      borderColor: theme.customColors.primary,
      shadowColor: theme.customColors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 16,
      elevation: 8,
    },
    successFlashBorder: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: theme.radius[24],
      borderWidth: 4,
      borderColor: theme.customColors.success || '#10B981',
      shadowColor: theme.customColors.success || '#10B981',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 12,
    },
    targetWatermark: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Corner Precision Brackets
    bracket: {
      position: 'absolute',
      width: 38,
      height: 38,
      borderColor: theme.customColors.primary,
      borderWidth: 4,
    },
    bracketTopLeft: {
      top: -2,
      left: -2,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderTopLeftRadius: theme.radius[24],
    },
    bracketTopRight: {
      top: -2,
      right: -2,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
      borderTopRightRadius: theme.radius[24],
    },
    bracketBottomLeft: {
      bottom: -2,
      left: -2,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomLeftRadius: theme.radius[24],
    },
    bracketBottomRight: {
      bottom: -2,
      right: -2,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      borderBottomRightRadius: theme.radius[24],
    },
    // Laser Scan Beam Line
    laserBeamContainer: {
      position: 'absolute',
      width: frameSize - 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    laserBeamGlow: {
      width: '100%',
      height: 12,
      borderRadius: 6,
      backgroundColor: `${theme.customColors.primary}40`,
    },
    laserBeamCore: {
      position: 'absolute',
      width: '94%',
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.customColors.primary,
      shadowColor: theme.customColors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 6,
    },
    // Floating Guidance Hint Pill
    hintPillContainer: {
      marginTop: theme.spacing[20],
      paddingHorizontal: theme.spacing[16],
    },
    hintPillBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.customColors.surface}E6`,
      paddingVertical: theme.spacing[8],
      paddingHorizontal: theme.spacing[16],
      borderRadius: theme.radius[20],
      borderWidth: 1,
      borderColor: `${theme.customColors.outline}40`,
      gap: theme.spacing[8] as unknown as number,
      ...theme.elevation.level2,
    },
    hintPillBoxError: {
      borderColor: theme.customColors.error || '#EF4444',
      backgroundColor: `${theme.customColors.error || '#EF4444'}15`,
    },
    hintPillText: {
      color: theme.customColors.textPrimary,
      fontWeight: '600',
    },
    // Quick Action Chips Toolbar
    chipsToolbarWrapper: {
      width: '100%',
      marginVertical: theme.spacing[12],
    },
    chipsScrollContent: {
      paddingHorizontal: theme.spacing[16],
    },
    chipItem: {
      marginRight: theme.spacing[8],
    },
    // Material 3 Bottom Action Panel
    bottomPanelContainer: {
      width: '100%',
      backgroundColor: theme.customColors.surfaceVariant,
      borderTopLeftRadius: theme.radius[32],
      borderTopRightRadius: theme.radius[32],
      paddingTop: theme.spacing[12],
      paddingHorizontal: theme.spacing[16],
      paddingBottom: Platform.OS === 'ios' ? theme.spacing[40] : theme.spacing[32],
      borderTopWidth: 1,
      borderColor: `${theme.customColors.outline}20`,
      ...theme.elevation.level4,
    },
    panelDragHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.customColors.outline,
      alignSelf: 'center',
      marginBottom: theme.spacing[16],
      opacity: 0.5,
    },
    actionGridRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    // Action Tile Primitive Styles
    actionTileContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing[4],
    },
    actionTileIconBox: {
      width: 50,
      height: 50,
      borderRadius: theme.radius[16],
      backgroundColor: theme.customColors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing[6],
      ...theme.elevation.level1,
    },
    actionTileIconBoxActive: {
      backgroundColor: theme.customColors.primary,
    },
    actionTileText: {
      color: theme.customColors.textSecondary,
      textAlign: 'center',
      fontWeight: '600',
    },
    actionTileTextActive: {
      color: theme.customColors.primary,
      fontWeight: '700',
    },
  });
