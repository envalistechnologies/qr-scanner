import React from 'react';
import { StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';
import { IconName, icons } from '../../theme/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface IconButtonProps extends BaseComponentProps {
  icon: keyof typeof icons | IconName;
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  size = 24,
  color,
  backgroundColor = 'transparent',
  loading = false,
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

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 150 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  const iconColor = disabled
    ? theme.customColors.disabled
    : color || theme.customColors.textPrimary;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          backgroundColor,
          width: Math.max(48, size + 24),
          height: Math.max(48, size + 24),
          borderRadius: Math.max(48, size + 24) / 2,
        },
        animatedStyle,
        style,
      ]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || icon.toString()}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <Icon name={icon} size={size} color={iconColor} disabled={disabled} />
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
