import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { PremiumButton } from '../buttons/PremiumButton';
import { OutlineButton } from '../buttons/OutlineButton';

export interface DialogProps {
  visible: boolean;
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  destructive?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  primaryButtonText = 'Confirm',
  secondaryButtonText = 'Cancel',
  onPrimaryPress,
  onSecondaryPress,
  destructive = false,
}) => {
  const { theme } = useAppTheme();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onSecondaryPress}>
      <Pressable style={styles.backdrop} onPress={onSecondaryPress} accessibilityLabel="Close Dialog">
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.contentWrap}>
          <Animated.View
            entering={ZoomIn.duration(200).springify()}
            style={[
              styles.dialogBox,
              {
                backgroundColor: theme.customColors.surface,
                borderColor: destructive ? theme.customColors.error : theme.customColors.divider,
                borderWidth: destructive ? 1 : StyleSheet.hairlineWidth,
                borderRadius: theme.radius[24],
                padding: theme.spacing[24],
                elevation: 10,
              },
            ]}
          >
            <Text
              style={[
                theme.typography.titleLarge,
                { color: destructive ? theme.customColors.error : theme.customColors.textPrimary, fontWeight: '800' },
              ]}
              numberOfLines={2}
            >
              {title}
            </Text>

            <Text
              style={[
                theme.typography.bodyMedium,
                { color: theme.customColors.textSecondary, marginTop: theme.spacing[12], lineHeight: 22 },
              ]}
            >
              {message}
            </Text>

            <View style={[styles.buttonRow, { marginTop: theme.spacing[24] }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                {onSecondaryPress && (
                  <OutlineButton title={secondaryButtonText} onPress={onSecondaryPress} fullWidth />
                )}
              </View>
              <View style={{ flex: 1.2, marginLeft: 8 }}>
                {onPrimaryPress && (
                  <PremiumButton
                    title={primaryButtonText}
                    onPress={onPrimaryPress}
                    fullWidth
                    style={destructive ? { backgroundColor: theme.customColors.error } : undefined}
                  />
                )}
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 420,
  },
  dialogBox: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
