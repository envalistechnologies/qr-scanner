/**
 * QuickScan Studio - Gallery Permission Explanation View
 * Phase 15 Architectural Layer
 * Displays the transparent privacy explanation screen before launching system photo library permission dialog.
 * Guarantees zero-storage and local memory processing for user peace of mind.
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { Icon, PremiumButton, OutlineButton } from '../../../components';
import { AppTheme } from '../../../types/theme';

export interface GalleryPermissionExplanationViewProps {
  onRequestPermission: () => void;
  onDecline?: () => void;
  isPermanentlyDenied?: boolean;
  onOpenSettings?: () => void;
  loading?: boolean;
}

export const GalleryPermissionExplanationView: React.FC<GalleryPermissionExplanationViewProps> = ({
  onRequestPermission,
  onDecline,
  isPermanentlyDenied = false,
  onOpenSettings,
  loading = false,
}) => {
  const { theme } = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container} testID="gallery-permission-explanation-view" accessibilityRole="summary">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.iconWrapper}>
          <Icon name="gallery" size={56} color={theme.customColors.primary} />
        </View>

        <Text style={[theme.typography.headlineMedium, styles.titleText]}>
          Photo Library & Media Access
        </Text>

        <View style={styles.badgeContainer}>
          <Icon name="shieldCheck" size={18} color={theme.customColors.success || '#10B981'} />
          <Text style={[theme.typography.labelSmall, styles.badgeText]}>
            LOCAL DEVICE SCANNING • ZERO SERVER UPLOADS
          </Text>
        </View>

        <View style={styles.explanationCard}>
          <Text style={[theme.typography.bodyLarge, styles.explanationText]}>
            When you select a picture from your device photo roll, QuickScan inspects the chosen image file solely within your phone's local volatile memory.
          </Text>
          <Text style={[theme.typography.bodyLarge, styles.explanationText, styles.paragraphSpacing]}>
            Our optical algorithms extract QR matrices and linear barcodes without ever modifying your original photos or transmitting any files across the internet. Once decoded, all temporary memory buffers are immediately purged.
          </Text>
          {isPermanentlyDenied && (
            <Text style={[theme.typography.bodyMedium, styles.warningText]}>
              Note: Photo library permission was previously declined or permanently disabled in system settings. To scan stored images, please open device settings to authorize access.
            </Text>
          )}
        </View>

        <View style={styles.actionButtonsContainer}>
          {isPermanentlyDenied && onOpenSettings ? (
            <PremiumButton
              title="Open Device Settings"
              icon="externalLink"
              onPress={onOpenSettings}
              loading={loading}
              fullWidth
              accessibilityLabel="Open system application settings for permission authorization"
            />
          ) : (
            <PremiumButton
              title="Authorize Photo Library"
              icon="gallery"
              onPress={onRequestPermission}
              loading={loading}
              fullWidth
              accessibilityLabel="Grant photo library hardware access"
            />
          )}

          {onDecline && (
            <View style={styles.declineSpacer}>
              <OutlineButton
                title="Not Now / Return"
                onPress={onDecline}
                disabled={loading}
                fullWidth
                accessibilityLabel="Decline photo access and return to previous view"
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
    warningText: {
      color: theme.customColors.error || '#EF4444',
      marginTop: theme.spacing[16],
      fontWeight: '600',
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

export default GalleryPermissionExplanationView;
