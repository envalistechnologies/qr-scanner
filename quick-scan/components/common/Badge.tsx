import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BaseComponentProps } from '../../types/theme';

export interface BadgeProps extends BaseComponentProps {
  count?: number;
  dot?: boolean;
  maxCount?: number;
  color?: string;
  textColor?: string;
  disabled?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  dot = false,
  maxCount = 99,
  color,
  textColor = '#FFFFFF',
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();
  const badgeColor = disabled
    ? theme.customColors.disabled
    : color || theme.customColors.error;

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          { backgroundColor: badgeColor, width: 10, height: 10, borderRadius: 5 },
          style,
        ]}
        testID={testID}
        accessibilityLabel={accessibilityLabel || 'New notifications dot'}
      />
    );
  }

  if (count === undefined || count <= 0) {
    return null;
  }

  const displayValue = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeColor,
          paddingHorizontal: theme.spacing[8],
          minWidth: 20,
          height: 20,
          borderRadius: 10,
        },
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `${count} notifications`}
    >
      <Text style={[theme.typography.labelSmall, { color: textColor }]}>
        {displayValue}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    alignSelf: 'flex-start',
  },
});
