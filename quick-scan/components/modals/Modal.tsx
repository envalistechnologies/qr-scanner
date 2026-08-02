import React from 'react';
import { View, Text, StyleSheet, Modal as RNModal, Pressable, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { PremiumButton } from '../buttons/PremiumButton';
import { TextButton } from '../buttons/TextButton';
import { BaseComponentProps } from '../../types/theme';

export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  description,
  children,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  loading = false,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  return (
    <RNModal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel || title || 'Dialog Modal'}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={!disabled && !loading ? onClose : undefined}
          accessibilityLabel="Dismiss dialog"
        />
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: theme.customColors.surface,
              borderRadius: theme.radius[24],
              padding: theme.spacing[24],
              width: '85%',
              maxWidth: 420,
              borderColor: theme.customColors.outline,
              borderWidth: StyleSheet.hairlineWidth,
            },
            theme.elevation.level3,
            style,
          ]}
        >
          {title && (
            <Text
              style={[
                theme.typography.headlineSmall,
                { color: theme.customColors.textPrimary, marginBottom: theme.spacing[8] },
              ]}
            >
              {title}
            </Text>
          )}

          {description && (
            <Text
              style={[
                theme.typography.bodyMedium,
                { color: theme.customColors.textSecondary, marginBottom: theme.spacing[16] },
              ]}
            >
              {description}
            </Text>
          )}

          {loading ? (
            <View style={{ paddingVertical: theme.spacing[24], alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.customColors.primary} />
            </View>
          ) : (
            children
          )}

          {(primaryActionLabel || secondaryActionLabel) && (
            <View style={[styles.actions, { marginTop: theme.spacing[24] }]}>
              {secondaryActionLabel && (
                <TextButton
                  title={secondaryActionLabel}
                  onPress={onSecondaryAction || onClose || (() => {})}
                  disabled={disabled || loading}
                  style={{ marginRight: theme.spacing[8] }}
                />
              )}
              {primaryActionLabel && (
                <PremiumButton
                  title={primaryActionLabel}
                  onPress={onPrimaryAction || (() => {})}
                  loading={loading}
                  disabled={disabled}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
