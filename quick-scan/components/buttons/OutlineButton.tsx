import React from 'react';
import { Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface OutlineButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({
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

  const borderColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.outline;
  const textColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.primary;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          borderColor,
          borderWidth: 1.5,
          borderRadius: theme.radius[32],
          paddingHorizontal: theme.spacing[24],
          width: fullWidth ? '100%' : undefined,
          minHeight: 48,
          backgroundColor: 'transparent',
        },
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
  },
});
