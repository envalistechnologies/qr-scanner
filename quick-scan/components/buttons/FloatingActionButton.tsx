import React from 'react';
import { Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';
import { IconName, icons } from '../../theme/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface FloatingActionButtonProps extends BaseComponentProps {
  icon: keyof typeof icons | IconName;
  onPress: () => void;
  label?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  label,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.94, { damping: 15, stiffness: 150 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  const bgColor = disabled
    ? theme.customColors.disabled
    : variant === 'primary'
    ? theme.customColors.primary
    : theme.customColors.secondaryContainer;

  const iconColor = disabled
    ? theme.customColors.surface
    : variant === 'primary'
    ? '#FFFFFF'
    : theme.customColors.secondary;

  const isExtended = Boolean(label);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderRadius: theme.radius[20],
          paddingHorizontal: isExtended ? theme.spacing[20] : 0,
          width: isExtended ? undefined : 56,
          height: 56,
          minWidth: 56,
        },
        theme.elevation.level4,
        animatedStyle,
        style,
      ]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label || icon.toString()}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          <Icon
            name={icon}
            size={24}
            color={iconColor}
            style={{ marginRight: isExtended ? theme.spacing[8] : 0 }}
          />
          {isExtended && (
            <Text style={[theme.typography.labelLarge, { color: iconColor }]}>
              {label}
            </Text>
          )}
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
