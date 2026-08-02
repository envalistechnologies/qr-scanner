import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BaseComponentProps } from '../../types/theme';

export interface SectionHeaderProps extends BaseComponentProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onActionPress,
  loading = false,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  const titleColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.textPrimary;
  const actionColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.primary;

  return (
    <View
      style={[
        styles.container,
        {
          paddingVertical: theme.spacing[12],
          paddingHorizontal: theme.spacing[16],
        },
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="header"
    >
      <Text
        style={[theme.typography.titleMedium, { color: titleColor, flex: 1 }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {loading && <ActivityIndicator size="small" color={theme.customColors.primary} />}

      {!loading && actionText && (
        <TouchableOpacity
          onPress={onActionPress}
          disabled={disabled}
          style={styles.actionButton}
          accessibilityRole="button"
          accessibilityLabel={actionText}
        >
          <Text style={[theme.typography.labelLarge, { color: actionColor }]}>
            {actionText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
