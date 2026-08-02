import React from 'react';
import { Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';

export interface TextButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const TextButton: React.FC<TextButtonProps> = ({
  title,
  onPress,
  icon,
  loading = false,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  const textColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.container,
        {
          paddingHorizontal: theme.spacing[16],
          minHeight: 48,
          opacity: pressed ? 0.7 : 1,
        },
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
              size={18}
              color={textColor}
              style={{ marginRight: theme.spacing[8] }}
            />
          )}
          <Text style={[theme.typography.labelLarge, { color: textColor }]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
