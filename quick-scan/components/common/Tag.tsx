import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';
import { IconName, icons } from '../../theme/icons';

export type TagVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface TagProps extends BaseComponentProps {
  label: string;
  variant?: TagVariant;
  icon?: keyof typeof icons | IconName;
  dot?: boolean;
  disabled?: boolean;
}

export const Tag: React.FC<TagProps> = ({
  label,
  variant = 'default',
  icon,
  dot = false,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  const getColors = () => {
    if (disabled) {
      return {
        bg: theme.customColors.surfaceVariant,
        text: theme.customColors.disabled,
      };
    }
    switch (variant) {
      case 'success':
        return {
          bg: theme.isDark ? '#065F46' : '#D1FAE5',
          text: theme.isDark ? '#34D399' : '#065F46',
        };
      case 'warning':
        return {
          bg: theme.isDark ? '#78350F' : '#FEF3C7',
          text: theme.isDark ? '#FBBF24' : '#92400E',
        };
      case 'error':
        return {
          bg: theme.isDark ? '#7F1D1D' : '#FEE2E2',
          text: theme.isDark ? '#F87171' : '#991B1B',
        };
      case 'info':
        return {
          bg: theme.isDark ? '#1E3A8A' : '#DBEAFE',
          text: theme.isDark ? '#60A5FA' : '#1E40AF',
        };
      case 'default':
      default:
        return {
          bg: theme.customColors.surfaceVariant,
          text: theme.customColors.textPrimary,
        };
    }
  };

  const { bg, text } = getColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderRadius: theme.radius[8],
          paddingHorizontal: theme.spacing[8],
          paddingVertical: theme.spacing[4],
        },
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `${label} tag`}
    >
      {dot && (
        <View
          style={[styles.dot, { backgroundColor: text, width: 6, height: 6, borderRadius: 3, marginRight: theme.spacing[4] }]}
        />
      )}
      {icon && (
        <Icon
          name={icon}
          size={14}
          color={text}
          style={{ marginRight: theme.spacing[4] }}
          disabled={disabled}
        />
      )}
      <Text style={[theme.typography.labelSmall, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
