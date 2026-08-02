import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { PremiumButton } from '../buttons/PremiumButton';
import { BaseComponentProps } from '../../types/theme';
import { IconName, icons } from '../../theme/icons';

export interface EmptyStateProps extends BaseComponentProps {
  title?: string;
  description?: string;
  icon?: keyof typeof icons | IconName;
  actionLabel?: string;
  onActionPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No items found',
  description = 'There is nothing to display here yet.',
  icon = 'info',
  actionLabel,
  onActionPress,
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
      accessibilityRole="summary"
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
        <Icon name={icon} size={44} color={theme.customColors.primary} disabled={disabled} />
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
        {description}
      </Text>

      {actionLabel && onActionPress && (
        <PremiumButton
          title={actionLabel}
          onPress={onActionPress}
          loading={loading}
          disabled={disabled}
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
