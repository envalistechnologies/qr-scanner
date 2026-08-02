import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { PremiumButton } from '../buttons/PremiumButton';
import { BaseComponentProps } from '../../types/theme';
import { IconName, icons } from '../../theme/icons';

export interface ErrorViewProps extends BaseComponentProps {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  icon?: keyof typeof icons | IconName;
  loading?: boolean;
  disabled?: boolean;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  retryLabel = 'Try Again',
  onRetry,
  icon = 'error',
  loading = false,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        { padding: theme.spacing[32], backgroundColor: theme.customColors.background },
        style,
      ]}
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel || title}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: theme.customColors.surfaceVariant,
            width: 80,
            height: 80,
            borderRadius: 40,
            marginBottom: theme.spacing[20],
          },
        ]}
      >
        <Icon name={icon} size={44} color={theme.customColors.error} disabled={disabled} />
      </View>

      <Text
        style={[
          theme.typography.headlineSmall,
          { color: theme.customColors.textPrimary, textAlign: 'center', marginBottom: theme.spacing[8] },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          theme.typography.bodyMedium,
          { color: theme.customColors.textSecondary, textAlign: 'center', marginBottom: theme.spacing[24] },
        ]}
      >
        {message}
      </Text>

      {onRetry && (
        <PremiumButton
          title={retryLabel}
          onPress={onRetry}
          loading={loading}
          disabled={disabled}
          icon="refresh"
          style={{ minWidth: 180 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
