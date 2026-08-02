/**
 * QuickScan Enterprise Studio - Global Google AdMob Interstitial Ad Modal
 * Phase 20: Renders full-screen interstitial advertisements in test/mock mode with compliant dismiss handles and zero-latency presentation
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, SafeAreaView, Alert } from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import { AdService } from '../../features/ads/AdService';

export const AdInterstitialModal: React.FC = () => {
  const theme = useTheme();
  const [visible, setVisible] = useState<boolean>(false);
  const [unitId, setUnitId] = useState<string>('');
  const [triggerReason, setTriggerReason] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(2);

  useEffect(() => {
    const adService = AdService.getInstance();
    const unsubscribe = adService.subscribeToInterstitial((isVis, id, reason) => {
      setVisible(isVis);
      setUnitId(id || 'ca-app-pub-7583323986111464/5173455105');
      setTriggerReason(reason || 'Sponsored Content Display');
      setCountdown(2);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let timer: any;
    if (visible && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [visible, countdown]);

  const handleDismiss = () => {
    if (countdown > 0) return;
    AdService.getInstance().dismissInterstitial();
  };

  const handleSimulatedClick = () => {
    Alert.alert('Simulated Ad Interaction', 'In production builds, this navigates to the sponsor advertiser destination.', [
      { text: 'OK', onPress: () => AdService.getInstance().dismissInterstitial() },
    ]);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent={false} animationType="fade" onRequestClose={handleDismiss} testID="interstitial-ad-modal">
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.elevation.level4 || '#121212' }]}>
        {/* Top Header Bar */}
        <View style={[styles.header, { backgroundColor: theme.colors.elevation.level2, borderColor: theme.colors.outlineVariant }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.adBadge, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.adBadgeText, { color: theme.colors.onPrimary }]}>AD</Text>
            </View>
            <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]} numberOfLines={1}>
              Google AdMob Interstitial
            </Text>
          </View>

          <Pressable
            style={[
              styles.closeButton,
              {
                backgroundColor: countdown > 0 ? theme.colors.surfaceDisabled : theme.colors.surfaceVariant,
                borderColor: theme.colors.outline,
              },
            ]}
            onPress={handleDismiss}
            disabled={countdown > 0}
            accessibilityLabel="Close Advertisement"
          >
            <Text style={[styles.closeButtonText, { color: countdown > 0 ? theme.colors.onSurfaceDisabled : theme.colors.onSurfaceVariant }]}>
              {countdown > 0 ? `${countdown}s` : '✕ Close'}
            </Text>
          </Pressable>
        </View>

        {/* Ad Body / Sponsor Studio Content */}
        <View style={styles.body}>
          <Surface style={[styles.adCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]} elevation={3}>
            <View style={[styles.heroBanner, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text style={[styles.heroTitle, { color: theme.colors.onPrimaryContainer }]}>
                ENVALIS STUDIO SOLUTIONS
              </Text>
              <Text style={[styles.heroSubtitle, { color: theme.colors.onPrimaryContainer }]}>
                Next-Generation Software Development & Digital Marketing Architecture
              </Text>
            </View>

            <View style={styles.adContent}>
              <Text style={[styles.adTagline, { color: theme.colors.primary }]}>
                RECOMMENDED PARTNER OFFER • EXCLUSIVE
              </Text>
              <Text style={[styles.adHeadline, { color: theme.colors.onSurface }]}>
                Scale your digital products with AI-driven visual engines and zero-latency infrastructure.
              </Text>
              <Text style={[styles.adDescription, { color: theme.colors.onSurfaceVariant }]}>
                Trusted by high-performance developers worldwide. Tap below to test advertisement engagement telemetry in Expo Go simulation.
              </Text>

              <View style={{ height: 24 }} />

              <Button
                mode="contained"
                onPress={handleSimulatedClick}
                style={[styles.ctaButton, { backgroundColor: theme.colors.primary }]}
                labelStyle={[styles.ctaButtonLabel, { color: theme.colors.onPrimary }]}
              >
                Learn More (Simulate Click)
              </Button>
            </View>
          </Surface>
        </View>

        {/* Footer Diagnostics */}
        <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant }]}>
          <Text style={[styles.footerText, { color: theme.colors.onSurfaceDisabled }]} numberOfLines={1}>
            Unit ID: {unitId}
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.onSurfaceDisabled }]} numberOfLines={1}>
            Event Trigger: {triggerReason}
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  adBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 10,
  },
  adBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  closeButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  heroBanner: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.9,
  },
  adContent: {
    padding: 24,
  },
  adTagline: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  adHeadline: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 12,
  },
  adDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaButton: {
    borderRadius: 14,
    paddingVertical: 6,
  },
  ctaButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
