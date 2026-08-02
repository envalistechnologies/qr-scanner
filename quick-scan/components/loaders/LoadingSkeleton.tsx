import React, { useEffect } from 'react';
import { StyleSheet, DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BaseComponentProps } from '../../types/theme';

export interface LoadingSkeletonProps extends BaseComponentProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  circle?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius,
  circle = false,
  style,
  testID,
}) => {
  const { theme } = useAppTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const radiusVal = circle
    ? typeof height === 'number'
      ? height / 2
      : 50
    : borderRadius !== undefined
    ? borderRadius
    : theme.radius[8];

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radiusVal,
          backgroundColor: theme.customColors.outline,
        },
        animatedStyle,
        style,
      ]}
      testID={testID}
      accessibilityLabel="Loading contents"
      accessibilityRole="progressbar"
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
});
