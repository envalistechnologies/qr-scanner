import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';
import { IconName, icons } from '../../theme/icons';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps extends BaseComponentProps {
  visible: boolean;
  message: string;
  title?: string;
  type?: ToastType;
  onDismiss?: () => void;
  autoHideDuration?: number;
  icon?: keyof typeof icons | IconName;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  title,
  type = 'info',
  onDismiss,
  autoHideDuration = 4000,
  icon,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 250 });

      if (autoHideDuration > 0 && onDismiss) {
        const timer = setTimeout(onDismiss, autoHideDuration);
        return () => clearTimeout(timer);
      }
    } else {
      translateY.value = withTiming(-100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, autoHideDuration, onDismiss, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) {
    return null;
  }

  const getTypeStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: theme.isDark ? '#064E3B' : '#ECFDF5',
          text: theme.isDark ? '#34D399' : '#047857',
          defaultIcon: 'success' as const,
        };
      case 'warning':
        return {
          bg: theme.isDark ? '#78350F' : '#FFFBEB',
          text: theme.isDark ? '#FBBF24' : '#B45309',
          defaultIcon: 'warning' as const,
        };
      case 'error':
        return {
          bg: theme.isDark ? '#7F1D1D' : '#FEF2F2',
          text: theme.isDark ? '#F87171' : '#B91C1C',
          defaultIcon: 'error' as const,
        };
      case 'info':
      default:
        return {
          bg: theme.isDark ? '#1E3A8A' : '#EFF6FF',
          text: theme.isDark ? '#60A5FA' : '#1D4ED8',
          defaultIcon: 'info' as const,
        };
    }
  };

  const { bg, text, defaultIcon } = getTypeStyle();
  const displayIcon = icon || defaultIcon;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderRadius: theme.radius[16],
          paddingVertical: theme.spacing[12],
          paddingHorizontal: theme.spacing[16],
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: text,
        },
        theme.elevation.level3,
        animatedStyle,
        style,
      ]}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel || `${type}: ${message}`}
    >
      <Icon name={displayIcon} size={24} color={text} style={{ marginRight: theme.spacing[12] }} />

      <View style={styles.textContainer}>
        {title && (
          <Text style={[theme.typography.titleSmall, { color: text }]} numberOfLines={1}>
            {title}
          </Text>
        )}
        <Text style={[theme.typography.bodyMedium, { color: text }]} numberOfLines={2}>
          {message}
        </Text>
      </View>

      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.closeButton} accessibilityRole="button" accessibilityLabel="Close notification">
          <Icon name="close" size={20} color={text} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
