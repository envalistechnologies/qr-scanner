import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BaseComponentProps } from '../../types/theme';

export interface LoadingViewProps extends BaseComponentProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  backgroundColor?: string;
  fullScreen?: boolean;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'Loading...',
  size = 'large',
  color,
  backgroundColor,
  fullScreen = true,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();
  const spinnerColor = color || theme.customColors.primary;
  const bgColor = backgroundColor || (fullScreen ? theme.customColors.background : 'transparent');

  return (
    <View
      style={[
        fullScreen ? styles.fullScreen : styles.container,
        { backgroundColor: bgColor, padding: theme.spacing[24] },
        style,
      ]}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel || message}
    >
      <ActivityIndicator size={size} color={spinnerColor} />
      {message ? (
        <Text
          style={[
            theme.typography.bodyMedium,
            { color: theme.customColors.textSecondary, marginTop: theme.spacing[16], textAlign: 'center' },
          ]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
});
