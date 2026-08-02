/**
 * QuickScan Studio - Camera Error Fallback View
 * Phase 12 Architectural & Camera Layer
 * Wraps reusable ErrorView component to gracefully manage hardware errors and authorization denials.
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, Linking, Platform } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { ErrorView } from '../../components';
import { AppTheme } from '../../types/theme';

export type CameraErrorType =
  | 'NO_CAMERA'
  | 'PERMISSION_DENIED'
  | 'PERMISSION_PERMANENTLY_DENIED'
  | 'CAMERA_BUSY'
  | 'INIT_FAILURE'
  | 'UNEXPECTED';

export interface CameraErrorFallbackProps {
  errorType: CameraErrorType;
  onRetry?: () => void;
  customMessage?: string;
}

export const CameraErrorFallback: React.FC<CameraErrorFallbackProps> = ({
  errorType,
  onRetry,
  customMessage,
}) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      if (onRetry) onRetry();
    }
  };

  const errorConfig = useMemo(() => {
    switch (errorType) {
      case 'NO_CAMERA':
        return {
          title: 'No Optical Lens Found',
          message:
            customMessage ||
            'QuickScan could not detect a compatible camera hardware unit on this device or emulator simulator. Please run on physical mobile hardware or switch to Gallery Import mode.',
          retryLabel: 'Retry Sensor Check',
          icon: 'camera' as const,
          action: onRetry,
        };
      case 'PERMISSION_DENIED':
        return {
          title: 'Camera Access Required',
          message:
            customMessage ||
            'Optical QR and barcode scanning requires live viewfinder authorization. Your privacy is fully protected with real-time volatile memory frame processing.',
          retryLabel: 'Grant Permission',
          icon: 'shieldCheck' as const,
          action: onRetry || handleOpenSettings,
        };
      case 'PERMISSION_PERMANENTLY_DENIED':
        return {
          title: 'Camera Access Disabled',
          message:
            customMessage ||
            'Camera hardware permission has been denied or restricted in system settings. Please open device application privacy controls to re-enable viewfinder access.',
          retryLabel: 'Open System Settings',
          icon: 'shieldCheck' as const,
          action: handleOpenSettings,
        };
      case 'CAMERA_BUSY':
        return {
          title: 'Camera Lens Busy',
          message:
            customMessage ||
            'The physical camera hardware sensor is currently occupied by another background task or process. Please release competing background apps and retry.',
          retryLabel: 'Reset Shutter Lens',
          icon: 'refresh' as const,
          action: onRetry,
        };
      case 'INIT_FAILURE':
        return {
          title: 'Lens Initialization Fault',
          message:
            customMessage ||
            'A low-level system communication exception occurred while activating optical hardware drivers. Tap below to re-initialize the capture session.',
          retryLabel: 'Reboot Sensor Engine',
          icon: 'error' as const,
          action: onRetry,
        };
      case 'UNEXPECTED':
      default:
        return {
          title: 'Viewfinder Exception',
          message:
            customMessage ||
            'An unexpected hardware stream anomaly interrupted camera rendering. Our recovery watchdog has isolated the thread.',
          retryLabel: 'Restart Viewfinder',
          icon: 'error' as const,
          action: onRetry,
        };
    }
  }, [errorType, customMessage, onRetry]);

  return (
    <View style={styles.container} testID={`camera-error-fallback-${errorType}`}>
      <ErrorView
        title={errorConfig.title}
        message={errorConfig.message}
        retryLabel={errorConfig.retryLabel}
        onRetry={errorConfig.action}
        icon={errorConfig.icon}
        style={styles.errorBox}
      />
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.customColors.background,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
    },
    errorBox: {
      width: '100%',
      justifyContent: 'center',
    },
  });

export default CameraErrorFallback;
