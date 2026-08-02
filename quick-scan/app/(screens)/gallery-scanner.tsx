/**
 * QuickScan Studio - Gallery Scanner Screen
 * Phase 15 Architectural & Optical Pipeline Layer
 * Decodes QR codes and barcodes from saved photographs without UI redesigns.
 * Integrates directly with Phase 14 Result Processing Engine and existing Result Screen.
 */
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useScanner } from '../../hooks/useScanner';
import { ScreenContainer, AppHeader, PremiumButton, OutlineButton, Icon, Tag } from '../../components';
import {
  GalleryScannerService,
  GalleryPermissionExplanationView,
  PipelineProgressEvent,
  PipelineExecutionResult,
} from '../../features/scanner';
import { PermissionService } from '../../services/PermissionService';
import { PermissionStatus } from '../../types/domain';

type GalleryScreenState = 'RESTING' | 'PERMISSION_EXPLANATION' | 'PROCESSING' | 'ERROR' | 'SUCCESS';

interface TestCase {
  id: string;
  label: string;
  uri: string;
  variant: 'live' | 'valid' | 'error' | 'permission';
}

const QA_TEST_CASES: TestCase[] = [
  { id: 'live', label: 'Live Device Gallery', uri: 'live', variant: 'live' },
  { id: 'jpg_qr', label: 'Single QR (JPG)', uri: 'demo-gallery://single-qr-jpg', variant: 'valid' },
  { id: 'png_barcode', label: 'Barcode (PNG)', uri: 'demo-gallery://barcode-png', variant: 'valid' },
  { id: 'webp_multi', label: 'Multi-Code (WEBP)', uri: 'demo-gallery://multi-code-webp', variant: 'valid' },
  { id: 'heic_vcard', label: 'Contact Card (HEIC)', uri: 'demo-gallery://heic-sample', variant: 'valid' },
  { id: 'jpeg_wifi', label: 'Wi-Fi Network (JPEG)', uri: 'demo-gallery://jpeg-sample', variant: 'valid' },
  { id: 'err_no_qr', label: 'No QR in Photo', uri: 'demo-gallery://no-qr', variant: 'error' },
  { id: 'err_corrupted', label: 'Corrupted Image', uri: 'demo-gallery://CORRUPTED_sample', variant: 'error' },
  { id: 'err_size', label: 'Oversized (25MB)', uri: 'demo-gallery://TOO_LARGE_oversized_25mb', variant: 'error' },
  { id: 'err_perm', label: 'Permission Denied', uri: 'permission_denied', variant: 'permission' },
];

export default function GalleryScannerScreen() {
  const { theme } = useAppTheme();
  const { recordScanResult } = useScanner();
  const galleryService = GalleryScannerService.getInstance();
  const permissionService = PermissionService.getInstance();

  const [screenState, setScreenState] = useState<GalleryScreenState>('RESTING');
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('not_determined');
  const [activeTestCase, setActiveTestCase] = useState<string>('live');
  const [progressEvent, setProgressEvent] = useState<PipelineProgressEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorHeader, setErrorHeader] = useState<string>('Scan Anomaly Detected');

  // Verify photo library permission status on mount
  useEffect(() => {
    permissionService.checkGalleryPermission().then((status) => {
      setPermissionStatus(status);
    });
  }, [permissionService]);

  const navigateToResult = useCallback((result: any) => {
    router.push({
      pathname: '/(screens)/scan-result',
      params: {
        id: result.id,
        rawValue: result.rawValue,
        displayTitle: result.displayTitle,
        symbology: result.symbology,
        isQR: result.isQR ? 'true' : 'false',
      },
    });
  }, []);

  const handleScanOutcome = useCallback(
    (outcome: PipelineExecutionResult) => {
      if (outcome.success && outcome.results.length > 0) {
        setScreenState('SUCCESS');
        // Instantly hand off the primary detected matrix to Phase 14 Result Screen & History
        const primaryResult = outcome.results[0];
        recordScanResult(primaryResult);
        navigateToResult(primaryResult);
      } else if (outcome.errorCode === 'CANCELLED') {
        setScreenState('RESTING');
      } else {
        setScreenState('ERROR');
        setErrorMessage(outcome.errorMessage || 'Optical recognition engine encountered an unreadable bitmap.');
        switch (outcome.errorCode) {
          case 'NO_QR_FOUND':
            setErrorHeader('No Optical Code Detected');
            break;
          case 'UNSUPPORTED_FORMAT':
            setErrorHeader('Unsupported File Format');
            break;
          case 'IMAGE_TOO_LARGE':
            setErrorHeader('Exceeded Memory Ceiling (20MB)');
            break;
          case 'CORRUPTED_IMAGE':
            setErrorHeader('Damaged or Corrupted File');
            break;
          default:
            setErrorHeader('Analysis Interruption');
        }
      }
    },
    [navigateToResult]
  );

  const triggerGalleryPicker = useCallback(async () => {
    setErrorMessage(null);
    setProgressEvent(null);

    // If permission is denied or undetermined, show explicit privacy explanation view first
    if (permissionStatus === 'denied' || permissionStatus === 'not_determined') {
      setScreenState('PERMISSION_EXPLANATION');
      return;
    }

    setScreenState('PROCESSING');
    const outcome = await galleryService.pickAndScanImage((ev) => setProgressEvent(ev));
    handleScanOutcome(outcome);
  }, [permissionStatus, galleryService, handleScanOutcome]);

  const handleSimulatedTest = useCallback(
    async (testCase: TestCase) => {
      setActiveTestCase(testCase.id);
      setErrorMessage(null);
      setProgressEvent(null);

      if (testCase.variant === 'live') {
        setScreenState('RESTING');
        return;
      }

      if (testCase.variant === 'permission') {
        setScreenState('PERMISSION_EXPLANATION');
        return;
      }

      setScreenState('PROCESSING');
      const outcome = await galleryService.scanImageUri(testCase.uri, undefined, (ev) => setProgressEvent(ev));
      handleScanOutcome(outcome);
    },
    [galleryService, handleScanOutcome]
  );

  const handleRequestPermission = useCallback(async () => {
    const status = await permissionService.requestGalleryPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      setScreenState('RESTING');
      triggerGalleryPicker();
    } else {
      setScreenState('RESTING');
      setErrorMessage('Device photo library permission was declined. QuickScan requires authorization to analyze stored photographs.');
      setErrorHeader('Permission Required');
      setScreenState('ERROR');
    }
  }, [permissionService, triggerGalleryPicker]);

  const handleCancelProcessing = useCallback(() => {
    galleryService.cancelActiveScan();
    setScreenState('RESTING');
    setProgressEvent(null);
  }, [galleryService]);

  // If permission explanation screen is active, render our high-end privacy view directly
  if (screenState === 'PERMISSION_EXPLANATION') {
    return (
      <GalleryPermissionExplanationView
        onRequestPermission={handleRequestPermission}
        onDecline={() => setScreenState('RESTING')}
        isPermanentlyDenied={permissionStatus === 'denied'}
        onOpenSettings={() => setScreenState('RESTING')}
      />
    );
  }

  return (
    <ScreenContainer scrollable withSafeArea testID="gallery-scanner-screen">
      <AppHeader title="Scan from Photos" subtitle="Decode pictures in device gallery" showBack={true} />

      {/* Dynamic Status Tag adhering 100% to existing UI layout */}
      <View style={{ marginTop: theme.spacing[16], alignItems: 'center' }}>
        {screenState === 'PROCESSING' ? (
          <Tag label="RUNNING OPTICAL VISION ENGINE..." variant="warning" dot />
        ) : screenState === 'ERROR' ? (
          <Tag label="ANOMALY DETECTED • MEMORY RELEASED" variant="error" dot />
        ) : (
          <Tag label="LOCAL RAM PHOTO DECODING ACTIVE" variant="success" dot />
        )}
      </View>

      {/* Exhaustive Phase 15 QA Verification Carousel Selector */}
      <View style={[styles.qaHeaderContainer, { marginTop: theme.spacing[24] }]}>
        <Text style={[theme.typography.labelSmall, { color: theme.customColors.textSecondary, fontWeight: '700' }]}>
          QA VERIFICATION & FORMAT SUITE (PHASE 15):
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.testChipsScroll, { gap: theme.spacing[8] }]}
      >
        {QA_TEST_CASES.map((tc) => {
          const isSelected = activeTestCase === tc.id && screenState !== 'RESTING' ? true : tc.id === 'live' && screenState === 'RESTING';
          return (
            <TouchableOpacity
              key={tc.id}
              style={[
                styles.testChip,
                {
                  backgroundColor: isSelected ? `${theme.customColors.primary}20` : theme.customColors.surfaceVariant,
                  borderColor: isSelected ? theme.customColors.primary : 'transparent',
                  borderWidth: 1,
                  borderRadius: theme.radius[16],
                  paddingHorizontal: theme.spacing[12],
                  paddingVertical: theme.spacing[8],
                },
              ]}
              onPress={() => handleSimulatedTest(tc)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  theme.typography.labelMedium,
                  { color: isSelected ? theme.customColors.primary : theme.customColors.textPrimary, fontWeight: isSelected ? '700' : '500' },
                ]}
              >
                {tc.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Primary Dropzone Container preserving original UI spacing and proportions */}
      <View style={[styles.dropzoneContainer, { marginVertical: theme.spacing[24] }]}>
        {screenState === 'PROCESSING' ? (
          <View
            style={[
              styles.dropzone,
              {
                backgroundColor: `${theme.customColors.primary}08`,
                borderColor: theme.customColors.primary,
                borderWidth: 2,
                borderRadius: theme.radius[24],
                padding: theme.spacing[36],
              },
            ]}
          >
            <ActivityIndicator size="large" color={theme.customColors.primary} style={{ marginBottom: theme.spacing[16] }} />
            <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, fontWeight: '700', textAlign: 'center' }]}>
              {progressEvent?.statusMessage || 'Scanning Optical Matrix...'}
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.customColors.primary, fontWeight: '600', marginTop: 8 }]}>
              PROGRESS: {progressEvent?.progressPercent || 30}% • LOCAL RAM DECODE
            </Text>
          </View>
        ) : screenState === 'ERROR' ? (
          <View
            style={[
              styles.dropzone,
              {
                backgroundColor: `${theme.customColors.error || '#EF4444'}10`,
                borderColor: theme.customColors.error || '#EF4444',
                borderWidth: 2,
                borderStyle: 'dashed',
                borderRadius: theme.radius[24],
                padding: theme.spacing[32],
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.customColors.surface, width: 80, height: 80, borderRadius: 40, marginBottom: theme.spacing[16] },
              ]}
            >
              <Icon name="shieldCheck" size={40} color={theme.customColors.error || '#EF4444'} />
            </View>
            <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, fontWeight: '700', textAlign: 'center' }]}>
              {errorHeader}
            </Text>
            <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: '90%' }]}>
              {errorMessage}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.dropzone,
              {
                backgroundColor: theme.customColors.surfaceVariant,
                borderColor: theme.customColors.primary,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderRadius: theme.radius[24],
                padding: theme.spacing[32],
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.customColors.surface, width: 80, height: 80, borderRadius: 40, marginBottom: theme.spacing[16] },
              ]}
            >
              <Icon name="gallery" size={44} color={theme.customColors.primary} />
            </View>
            <Text style={[theme.typography.titleMedium, { color: theme.customColors.textPrimary, fontWeight: '700', textAlign: 'center' }]}>
              Select Image with QR Code
            </Text>
            <Text style={[theme.typography.bodyMedium, { color: theme.customColors.textSecondary, textAlign: 'center', marginTop: 8, maxWidth: '85%' }]}>
              Choose a saved photograph, PNG, JPG, WEBP, or HEIC image containing a QR code or barcode from your camera roll.
            </Text>
          </View>
        )}
      </View>

      {/* Action Controller preserving exact original styling and spacing */}
      {screenState === 'PROCESSING' ? (
        <OutlineButton
          title="Cancel Analysis & Release RAM"
          icon="close"
          onPress={handleCancelProcessing}
          fullWidth
          style={{ marginBottom: theme.spacing[12] }}
        />
      ) : (
        <PremiumButton
          title="Open Device Photo Library"
          icon="gallery"
          onPress={triggerGalleryPicker}
          fullWidth
          disabled={false}
          style={{ marginBottom: theme.spacing[12] }}
        />
      )}

      <OutlineButton
        title="Back to Camera Scanner"
        icon="camera"
        onPress={() => router.back()}
        fullWidth
      />

      <View style={{ height: theme.spacing[48] }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  qaHeaderContainer: {
    paddingHorizontal: 4,
  },
  testChipsScroll: {
    paddingVertical: 12,
  },
  testChip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneContainer: {
    alignItems: 'center',
    width: '100%',
  },
  dropzone: {
    alignItems: 'center',
    width: '92%',
  },
  iconCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
