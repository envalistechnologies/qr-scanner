import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';
import { IconName, icons } from '../../theme/icons';

export interface ListItemProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  leadingIcon?: keyof typeof icons | IconName;
  trailingIcon?: keyof typeof icons | IconName;
  leadingElement?: React.ReactNode;
  trailingElement?: React.ReactNode;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  showDivider?: boolean;
}

export const ListItem: React.FC<ListItemProps> = React.memo(({
  title,
  subtitle,
  leadingIcon,
  trailingIcon = 'chevronRight',
  leadingElement,
  trailingElement,
  onPress,
  loading = false,
  disabled = false,
  showDivider = true,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  const titleColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.textPrimary;
  const subtitleColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.textSecondary;
  const iconColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.textSecondary;

  const renderContent = () => (
    <View
      style={[
        styles.row,
        {
          minHeight: 56,
          paddingHorizontal: theme.spacing[16],
          paddingVertical: theme.spacing[12],
        },
      ]}
    >
      <View style={styles.leadingContainer}>
        {leadingElement ? (
          leadingElement
        ) : leadingIcon ? (
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor: theme.customColors.surfaceVariant,
                borderRadius: theme.radius[12],
                marginRight: theme.spacing[16],
              },
            ]}
          >
            <Icon name={leadingIcon} size={24} color={theme.customColors.primary} disabled={disabled} />
          </View>
        ) : null}
      </View>

      <View style={styles.textContainer}>
        <Text style={[theme.typography.titleSmall, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              theme.typography.bodySmall,
              { color: subtitleColor, marginTop: theme.spacing[4] },
            ]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.trailingContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={theme.customColors.primary} />
        ) : trailingElement ? (
          trailingElement
        ) : onPress ? (
          <Icon name={trailingIcon} size={24} color={iconColor} disabled={disabled} />
        ) : null}
      </View>
    </View>
  );

  const wrapperStyle = [
    styles.container,
    showDivider ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.customColors.divider } : {},
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          wrapperStyle,
          { backgroundColor: pressed ? theme.customColors.surfaceVariant : 'transparent' },
        ]}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityState={{ disabled: disabled || loading }}
      >
        {renderContent()}
      </Pressable>
    );
  }

  return (
    <View style={wrapperStyle} testID={testID} accessibilityLabel={accessibilityLabel || title}>
      {renderContent()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  trailingContainer: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 24,
  },
});
