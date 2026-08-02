import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BaseComponentProps } from '../../types/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CardProps extends BaseComponentProps {
  children: React.ReactNode;
  onPress?: () => void;
  elevationLevel?: 0 | 1 | 2 | 3 | 4 | 5;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  elevationLevel = 1,
  loading = false,
  disabled = false,
  variant = 'elevated',
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
    if (onPress && !disabled && !loading) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
    }
  };

  const handlePressOut = () => {
    if (onPress && !disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  const getBackgroundColor = () => {
    if (variant === 'filled') {
      return theme.customColors.surfaceVariant;
    }
    return theme.customColors.surface;
  };

  const getBorderProps = () => {
    if (variant === 'outlined') {
      return {
        borderWidth: 1,
        borderColor: theme.customColors.outline,
      };
    }
    return {};
  };

  const getElevation = () => {
    if (variant === 'elevated') {
      const key = `level${elevationLevel}` as keyof typeof theme.elevation;
      return theme.elevation[key] || theme.elevation.level1;
    }
    return theme.elevation.level0;
  };

  const content = loading ? (
    <View style={[styles.loadingContainer, { minHeight: 100 }]}>
      <ActivityIndicator color={theme.customColors.primary} size="small" />
    </View>
  ) : (
    children
  );

  const containerStyles = [
    styles.container,
    {
      backgroundColor: getBackgroundColor(),
      borderRadius: theme.radius[16],
      padding: theme.spacing[16],
      opacity: disabled ? 0.6 : 1,
    },
    getBorderProps(),
    getElevation(),
    onPress ? animatedStyle : {},
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={containerStyles as any}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View style={containerStyles as any} testID={testID} accessibilityLabel={accessibilityLabel}>
      {content}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
