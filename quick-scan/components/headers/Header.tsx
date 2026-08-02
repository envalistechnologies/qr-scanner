import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';

export interface HeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  rightAction,
  loading = false,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  const textColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.textPrimary;
  const subtitleColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.textSecondary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.customColors.background,
          borderBottomColor: theme.customColors.divider,
          paddingHorizontal: theme.spacing[16],
          minHeight: 56,
        },
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="header"
    >
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity
            onPress={onBackPress}
            disabled={disabled || loading}
            style={[styles.backButton, { marginRight: theme.spacing[12] }]}
            accessibilityRole="button"
            accessibilityLabel="Navigate back"
          >
            <Icon name="arrowBack" size={24} color={textColor} disabled={disabled} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text
            style={[theme.typography.titleLarge, { color: textColor }]}
            numberOfLines={1}
            accessibilityRole="header"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[
                theme.typography.bodySmall,
                { color: subtitleColor, marginTop: theme.spacing[4] },
              ]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.customColors.primary} />
        ) : (
          rightAction || null
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 48,
    minHeight: 48,
  },
});
