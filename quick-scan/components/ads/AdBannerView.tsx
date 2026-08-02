/**
 * QuickScan Enterprise Studio - Responsive Google AdMob Banner View Component
 * Phase 20: Auto-collapsing banner layout with strict screen authorization auditing and zero-crash Expo Go test mode rendering
 */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { AdService } from '../../features/ads/AdService';

export interface AdBannerViewProps {
  screenName: string;
  style?: StyleProp<ViewStyle>;
  testLabel?: string;
}

export const AdBannerView: React.FC<AdBannerViewProps> = ({
  screenName,
  style,
  testLabel = 'Google AdMob Banner [ 320 x 50 ]',
}) => {
  const theme = useTheme();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [unitId, setUnitId] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadBanner = async () => {
      const adSvc = AdService.getInstance();
      const res = await adSvc.requestBanner(screenName);
      if (isMounted) {
        if (res.success) {
          setIsAuthorized(true);
          setUnitId(res.unitId);
          setIsLoaded(true);
        } else {
          // Screen forbidden or ad fill failed; stay completely hidden with zero whitespace
          setIsAuthorized(false);
          setIsLoaded(false);
        }
      }
    };

    loadBanner();

    return () => {
      isMounted = false;
      AdService.getInstance().releaseBanner(screenName);
    };
  }, [screenName]);

  // Completely vanish without consuming layout space if ad failed or screen is excluded by Google Play policy
  if (!isAuthorized || !isLoaded) {
    return null;
  }

  return (
    <Surface
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.elevation.level1,
          borderColor: theme.colors.outlineVariant,
        },
        style,
      ]}
      elevation={1}
      accessibilityRole="image"
      accessibilityLabel={`Advertisement banner for screen ${screenName}. Unit: ${unitId}`}
    >
      <View style={styles.content}>
        <View style={[styles.badge, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text style={[styles.badgeText, { color: theme.colors.onSecondaryContainer }]}>AD</Text>
        </View>
        <Text style={[styles.label, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
          {testLabel}
        </Text>
        <Text style={[styles.unitText, { color: theme.colors.onSurfaceDisabled }]} numberOfLines={1}>
          {unitId?.split('/')[1] || 'TEST_UNIT'}
        </Text>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 600, // Responsive tablet constraint
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  unitText: {
    fontSize: 10,
    fontFamily: 'monospace',
    marginLeft: 8,
  },
});
