import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';
import { IconName, icons } from '../../theme/icons';

export interface SettingRowProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof icons | IconName;
  type?: 'chevron' | 'switch' | 'dropdown' | 'none';
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  dropdownValue?: string;
  onPress?: () => void;
  destructive?: boolean;
  showDivider?: boolean;
  disabled?: boolean;
}

export const SettingRow: React.FC<SettingRowProps> = React.memo(({
  title,
  subtitle,
  icon,
  type = 'chevron',
  switchValue = false,
  onSwitchChange,
  dropdownValue,
  onPress,
  destructive = false,
  showDivider = true,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    if (type === 'switch' && onSwitchChange) {
      onSwitchChange(!switchValue);
    } else if (onPress) {
      onPress();
    }
  };

  const titleColor = disabled
    ? theme.customColors.textDisabled
    : destructive
    ? theme.customColors.error
    : theme.customColors.textPrimary;

  const iconColor = disabled
    ? theme.customColors.textDisabled
    : destructive
    ? theme.customColors.error
    : theme.customColors.primary;

  const iconBg = destructive ? 'rgba(255, 59, 48, 0.15)' : theme.customColors.surfaceVariant;

  const renderTrailing = () => {
    if (type === 'switch') {
      return (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          disabled={disabled}
          trackColor={{ false: theme.customColors.outline, true: theme.customColors.primaryContainer }}
          thumbColor={switchValue ? theme.customColors.primary : theme.customColors.surface}
          ios_backgroundColor={theme.customColors.surfaceVariant}
          accessibilityRole="switch"
          accessibilityState={{ checked: switchValue, disabled }}
        />
      );
    }

    if (type === 'dropdown' && dropdownValue) {
      return (
        <View
          style={[
            styles.dropdownBadge,
            {
              backgroundColor: theme.customColors.surfaceVariant,
              borderColor: theme.customColors.divider,
              borderRadius: theme.radius[12],
              paddingHorizontal: theme.spacing[12],
              paddingVertical: theme.spacing[6],
            },
          ]}
        >
          <Text style={[theme.typography.labelMedium, { color: theme.customColors.textPrimary, marginRight: 6, fontWeight: '600' }]} numberOfLines={1}>
            {dropdownValue}
          </Text>
          <Icon name="chevronDown" size={16} color={theme.customColors.textSecondary} />
        </View>
      );
    }

    if (type === 'chevron') {
      return <Icon name="chevronRight" size={22} color={theme.customColors.textSecondary} />;
    }

    return null;
  };

  const outerContainerStyles = [
    styles.container,
    showDivider && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.customColors.divider },
    style,
  ];

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => {
        if (onPress || type === 'switch') {
          scale.value = withSpring(0.98, { damping: 15, stiffness: 250 });
        }
      }}
      onPressOut={() => {
        if (onPress || type === 'switch') {
          scale.value = withSpring(1, { damping: 15, stiffness: 250 });
        }
      }}
      disabled={disabled && type !== 'switch'}
      style={({ pressed }) => [
        outerContainerStyles,
        { backgroundColor: pressed && !disabled ? theme.customColors.surfaceVariant : 'transparent' },
      ]}
      testID={testID}
      accessibilityRole={type === 'switch' ? 'switch' : 'button'}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled }}
    >
      <Animated.View style={[styles.rowContent, { paddingVertical: theme.spacing[16] }, animatedStyle]}>
        {icon && (
          <View style={[styles.iconWrapper, { backgroundColor: iconBg, borderRadius: 14, marginRight: theme.spacing[16] }]}>
            <Icon name={icon} size={22} color={iconColor} />
          </View>
        )}

        <View style={styles.textWrap}>
          <Text style={[theme.typography.titleMedium, { color: titleColor, fontWeight: '600' }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[theme.typography.bodySmall, { color: theme.customColors.textSecondary, marginTop: 3 }]} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>

        <View style={styles.trailingWrap}>{renderTrailing()}</View>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  trailingWrap: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
