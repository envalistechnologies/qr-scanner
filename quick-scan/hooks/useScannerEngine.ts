/**
 * QuickScan Studio - Real-Time Optical Scanner Engine Hook
 * Phase 13 Architectural Layer
 * Coordinates high-FPS barcode detection, duplicate suppression, configurable cooldown timers,
 * multi-modal success alerts (haptics + audio), and automatic lifecycle pausing during navigation.
 */
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ScanResult } from '../types/domain';
import { ScannerService } from '../services/ScannerService';
import { useCameraLifecycle } from './useCameraLifecycle';

export interface UseScannerEngineOptions {
  /** Configurable cooldown window in milliseconds before the exact same code or next read is accepted. */
  cooldownMs?: number;
  /** Whether tactile impact haptic feedback should fire on successful detection. */
  enableHaptics?: boolean;
  /** Whether acoustic audio beep alert should play on successful detection. */
  enableSound?: boolean;
  /** Callback triggered immediately upon capturing a valid, non-duplicate scan result. */
  onScanSuccess: (result: ScanResult) => void;
  /** Callback triggered if optical hardware encounters unreadable or corrupt parity bits. */
  onScanError?: (errorMessage: string) => void;
}

export interface ScannerEngineState {
  isScanningEnabled: boolean;
  isProcessing: boolean;
  lastScannedResult: ScanResult | null;
  supportedBarcodeTypes: string[];
  handleBarcodeScanned: (event: { type: string; data: string }) => void;
  resetScannerState: () => void;
}

export const useScannerEngine = ({
  cooldownMs = 1800,
  enableHaptics = true,
  enableSound = false,
  onScanSuccess,
  onScanError,
}: UseScannerEngineOptions): ScannerEngineState => {
  const { isCameraActive } = useCameraLifecycle();
  const scannerService = useMemo(() => ScannerService.getInstance(), []);
  const supportedBarcodeTypes = useMemo(() => scannerService.getSupportedBarcodeTypes(), [scannerService]);

  const [isScanningEnabled, setIsScanningEnabled] = useState<boolean>(true);
  const [lastScannedResult, setLastScannedResult] = useState<ScanResult | null>(null);

  // High-FPS thread non-reactive memory refs to avoid unnecessary re-renders during video streaming
  const isProcessingRef = useRef<boolean>(false);
  const lastScanCacheRef = useRef<{ data: string; timestamp: number } | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up any timers upon unmount or navigation away
  const clearCooldownTimer = useCallback(() => {
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearCooldownTimer();
    };
  }, [clearCooldownTimer]);

  // Synchronize scanner readiness with app backgrounding & navigation screen focus
  useEffect(() => {
    if (!isCameraActive) {
      // Pause engine while away on result screen or when mobile goes to background
      isProcessingRef.current = false;
      setIsScanningEnabled(false);
      clearCooldownTimer();
    } else {
      // Automatically resume active scanning upon returning to viewfinder screen
      isProcessingRef.current = false;
      setIsScanningEnabled(true);
    }
  }, [isCameraActive, clearCooldownTimer]);

  /**
   * Triggers multi-modal haptic vibration and audio synthesizer alerts upon capture.
   */
  const triggerSuccessAlerts = useCallback(async () => {
    // 1. Tactile Haptic Vibration Alert
    if (enableHaptics) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Fallback to React Native basic vibration if advanced Expo Haptics is unsupported on device
        try {
          Vibration.vibrate(80);
        } catch {
          // Silently ignore simulator vibration exceptions
        }
      }
    }

    // 2. Audible Alert (Optional Configurable - silenced to avoid SDK 54 expo-av deprecation warnings)
    if (enableSound) {
      // Audio playback reserved for modern expo-audio in future SDK iterations
    }
  }, [enableHaptics, enableSound]);

  /**
   * Manually resets scanner cooldown and enables capture (e.g. user taps to rescan immediately).
   */
  const resetScannerState = useCallback(() => {
    clearCooldownTimer();
    isProcessingRef.current = false;
    setIsScanningEnabled(true);
    lastScanCacheRef.current = null;
  }, [clearCooldownTimer]);

  /**
   * High-FPS optimized hardware barcode event handler.
   * Enforces single-scan discipline and duplicate filtering before dispatching to domain services.
   */
  const handleBarcodeScanned = useCallback(
    ({ type, data }: { type: string; data: string }) => {
      // Short-circuit instantly if engine is paused, inactive, or already processing a frame
      if (!isScanningEnabled || !isCameraActive || isProcessingRef.current) {
        return;
      }

      const now = Date.now();

      // Duplicate Scan Protection & Cooldown Filtering
      if (
        lastScanCacheRef.current &&
        lastScanCacheRef.current.data === data &&
        now - lastScanCacheRef.current.timestamp < cooldownMs
      ) {
        // Suppress rapid duplicate frames from high-FPS camera streams
        return;
      }

      // Lock engine so ONLY ONE code is captured at a time
      isProcessingRef.current = true;
      setIsScanningEnabled(false);
      lastScanCacheRef.current = { data, timestamp: now };

      // Translate optical hardware feed into structured domain representation
      const processedResult = scannerService.processBarcodeScan(type, data);

      if (processedResult) {
        setLastScannedResult(processedResult);
        triggerSuccessAlerts().catch(() => { });
        onScanSuccess(processedResult);

        // Schedule automated cooldown unlock
        clearCooldownTimer();
        cooldownTimerRef.current = setTimeout(() => {
          if (isCameraActive) {
            isProcessingRef.current = false;
            setIsScanningEnabled(true);
          }
        }, cooldownMs);
      } else {
        // Handle unreadable or corrupted barcode anomaly
        if (onScanError) {
          onScanError('Unrecognized optical symbology or corrupted parity bits detected.');
        }
        // Brief recovery penalty before retrying sensor read
        clearCooldownTimer();
        cooldownTimerRef.current = setTimeout(() => {
          isProcessingRef.current = false;
          setIsScanningEnabled(true);
        }, 800);
      }
    },
    [
      isScanningEnabled,
      isCameraActive,
      cooldownMs,
      scannerService,
      triggerSuccessAlerts,
      onScanSuccess,
      onScanError,
      clearCooldownTimer,
    ]
  );

  return {
    isScanningEnabled,
    isProcessing: isProcessingRef.current,
    lastScannedResult,
    supportedBarcodeTypes,
    handleBarcodeScanned,
    resetScannerState,
  };
};
