import React from 'react';
import { Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface PremiumButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
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
      scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  const bgColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.primary;
  const textColor = disabled
    ? theme.customColors.surface
    : '#FFFFFF';

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
          borderRadius: theme.radius[32],
          paddingHorizontal: theme.spacing[24],
          width: fullWidth ? '100%' : undefined,
          minHeight: 48,
        },
        theme.elevation.level2,
        animatedStyle,
        style,
      ]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && (
            <Icon
              name={icon as any}
              size={20}
              color={textColor}
              style={{ marginRight: theme.spacing[8] }}
            />
          )}
          <Text style={[theme.typography.labelLarge, { color: textColor }]}>
            {title}
          </Text>
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
    overflow: 'hidden',
  },
});
