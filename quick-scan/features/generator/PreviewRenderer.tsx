/**
 * QuickScan Studio - QR Matrix Preview Renderer
 * Phase 16 Architectural Layer
 * Debounced, 100% offline local canvas and vector QR generator using react-native-qrcode-svg.
 * Zero UI freezing and zero unnecessary renders during typing.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../../components';

export interface PreviewRendererProps {
  payload: string;
  foregroundColor?: string;
  backgroundColor?: string;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  logoIconName?: any;
  showCenterBadge?: boolean;
  size?: number;
  onSvgRef?: (ref: any) => void;
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({
  payload,
  foregroundColor = '#3B82F6',
  backgroundColor = '#FFFFFF',
  margin = 8,
  errorCorrectionLevel = 'H',
  logoIconName,
  showCenterBadge = false,
  size = 200,
  onSvgRef,
}) => {
  const { theme } = useAppTheme();
  const [debouncedPayload, setDebouncedPayload] = useState<string>(payload);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // 250ms debounce update to avoid excessive Reanimated/SVG layout repaints during rapid user typing
  useEffect(() => {
    if (payload === debouncedPayload) return;
    setIsUpdating(true);
    const timer = setTimeout(() => {
      setDebouncedPayload(payload || 'https://envalis.technologies.studio');
      setIsUpdating(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [payload, debouncedPayload]);

  const safePayload = useMemo(() => {
    return debouncedPayload.trim() ? debouncedPayload : 'https://envalis.technologies.studio/quickscan';
  }, [debouncedPayload]);

  // Convert string level to exact prop required by react-native-qrcode-svg
  const ecLevel = useMemo<'L' | 'M' | 'Q' | 'H'>(() => {
    if (['L', 'M', 'Q', 'H'].includes(errorCorrectionLevel)) {
      return errorCorrectionLevel as any;
    }
    return 'H';
  }, [errorCorrectionLevel]);

  return (
    <View style={[styles.container, { width: size + margin * 2, height: size + margin * 2, backgroundColor }]}>
      {isUpdating ? (
        <View style={styles.updatingLoader}>
          <ActivityIndicator size="small" color={foregroundColor} />
        </View>
      ) : (
        <View style={styles.matrixWrap}>
          <QRCode
            value={safePayload}
            size={size}
            color={foregroundColor}
            backgroundColor={backgroundColor}
            ecl={ecLevel}
            quietZone={margin}
            getRef={(ref) => {
              if (onSvgRef && ref) {
                onSvgRef(ref);
              }
            }}
          />
          {showCenterBadge && logoIconName && (
            <View
              style={[
                styles.centerBadge,
                {
                  backgroundColor: theme.customColors.surface,
                  borderColor: foregroundColor,
                  borderWidth: 1.5,
                  borderRadius: theme.radius[12],
                  width: Math.max(38, size * 0.22),
                  height: Math.max(38, size * 0.22),
                },
              ]}
            >
              <Icon name={logoIconName} size={Math.max(20, size * 0.12)} color={foregroundColor} />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  matrixWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  updatingLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBadge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
});
