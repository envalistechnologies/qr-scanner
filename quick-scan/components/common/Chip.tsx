import React from 'react';
import { Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';
import { IconName, icons } from '../../theme/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ChipProps extends BaseComponentProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof icons | IconName;
  loading?: boolean;
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
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
    if (onPress && !disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    }
  };

  const handlePressOut = () => {
    if (onPress && !disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  const bgColor = disabled
    ? theme.customColors.disabled
    : selected
    ? theme.customColors.primaryContainer
    : theme.customColors.surfaceVariant;

  const textColor = disabled
    ? theme.customColors.surface
    : selected
    ? theme.customColors.primary
    : theme.customColors.textPrimary;

  const borderColor = selected ? theme.customColors.primary : theme.customColors.outline;

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" style={{ marginRight: theme.spacing[8] }} />
      ) : icon || selected ? (
        <Icon
          name={icon || 'check'}
          size={18}
          color={textColor}
          style={{ marginRight: theme.spacing[8] }}
          disabled={disabled}
        />
      ) : null}
      <Text style={[theme.typography.labelMedium, { color: textColor }]}>{label}</Text>
    </>
  );

  const chipStyles = [
    styles.container,
    {
      backgroundColor: bgColor,
      borderColor: selected ? borderColor : 'transparent',
      borderWidth: 1,
      borderRadius: theme.radius[16],
      paddingHorizontal: theme.spacing[12],
      height: 36,
      opacity: disabled ? 0.6 : 1,
    },
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[chipStyles, animatedStyle]}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityState={{ selected, disabled: disabled || loading }}
      >
        {renderContent()}
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View style={chipStyles} testID={testID} accessibilityLabel={accessibilityLabel || label}>
      {renderContent()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
