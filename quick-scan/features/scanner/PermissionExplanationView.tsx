/**
 * QuickScan Studio - Permission Explanation View
 * Phase 12 Architectural & Camera Layer
 * Displays the transparent Phase 10 privacy explanation screen before launching system permission dialog.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon, PremiumButton, OutlineButton } from '../../components';
import { AppTheme } from '../../types/theme';

export interface PermissionExplanationViewProps {
  onRequestPermission: () => void;
  onDecline?: () => void;
  loading?: boolean;
}

export const PermissionExplanationView: React.FC<PermissionExplanationViewProps> = ({
  onRequestPermission,
  onDecline,
  loading = false,
}) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container} testID="camera-permission-explanation-view" accessibilityRole="summary">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.iconWrapper}>
          <Icon name="camera" size={56} color={theme.customColors.primary} />
        </View>

        <Text style={[theme.typography.headlineMedium, styles.titleText]}>
          Camera & Viewfinder Access
        </Text>

        <View style={styles.badgeContainer}>
          <Icon name="shieldCheck" size={18} color={theme.customColors.success || '#10B981'} />
          <Text style={[theme.typography.labelSmall, styles.badgeText]}>
            100% VOLATILE RAM PROCESSING • ZERO STORAGE
          </Text>
        </View>

        <View style={styles.explanationCard}>
          <Text style={[theme.typography.bodyLarge, styles.explanationText]}>
            When you grant QuickScan permission to utilize your mobile device camera, our optical recognition engine accesses raw video frames solely in volatile active Random Access Memory (RAM).
          </Text>
          <Text style={[theme.typography.bodyLarge, styles.explanationText, styles.paragraphSpacing]}>
            Frames are immediately processed for QR matrices and product barcodes, and discarded in real-time within microseconds. No photography, video feeds, or ambient environmental data is ever written to internal flash storage or transmitted to servers.
          </Text>
        </View>

        <View style={styles.actionButtonsContainer}>
          <PremiumButton
            title="Allow Camera Access"
            icon="camera"
            onPress={onRequestPermission}
            loading={loading}
            fullWidth
            accessibilityLabel="Allow camera hardware access"
          />
          {onDecline && (
            <View style={styles.declineSpacer}>
              <OutlineButton
                title="Not Now"
                onPress={onDecline}
                disabled={loading}
                fullWidth
                accessibilityLabel="Decline camera access and return"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.customColors.background,
      zIndex: 10,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing[24],
      paddingVertical: theme.spacing[48],
    },
    iconWrapper: {
      width: 100,
      height: 100,
      borderRadius: theme.radius[26],
      backgroundColor: theme.customColors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing[24],
      borderWidth: 1,
      borderColor: `${theme.customColors.primary}30`,
    },
    titleText: {
      color: theme.customColors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing[12],
    },
    badgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.customColors.success || '#10B981'}15`,
      paddingHorizontal: theme.spacing[16],
      paddingVertical: theme.spacing[8],
      borderRadius: theme.radius[20],
      marginBottom: theme.spacing[28],
    },
    badgeText: {
      color: theme.customColors.success || '#10B981',
      marginLeft: theme.spacing[8],
      fontWeight: '700',
    },
    explanationCard: {
      backgroundColor: theme.customColors.surface,
      padding: theme.spacing[24],
      borderRadius: theme.radius[26],
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.customColors.divider,
      marginBottom: theme.spacing[36],
      width: '100%',
    },
    explanationText: {
      color: theme.customColors.textSecondary,
      lineHeight: 24,
    },
    paragraphSpacing: {
      marginTop: theme.spacing[16],
    },
    actionButtonsContainer: {
      width: '100%',
      alignItems: 'center',
    },
    declineSpacer: {
      marginTop: theme.spacing[16],
      width: '100%',
    },
  });

export default PermissionExplanationView;
