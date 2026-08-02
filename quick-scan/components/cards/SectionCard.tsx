import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Card, CardProps } from './Card';

export interface SectionCardProps extends Omit<CardProps, 'onPress'> {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  subtitle,
  actionText,
  onActionPress,
  children,
  style,
  testID,
  ...cardProps
}) => {
  const { theme } = useAppTheme();

  const titleColor = cardProps.disabled
    ? theme.customColors.disabled
    : theme.customColors.textPrimary;
  const subtitleColor = cardProps.disabled
    ? theme.customColors.disabled
    : theme.customColors.textSecondary;
  const actionColor = cardProps.disabled
    ? theme.customColors.disabled
    : theme.customColors.primary;

  return (
    <Card style={[styles.container, style]} testID={testID} {...cardProps}>
      <View style={[styles.header, { marginBottom: theme.spacing[12] }]}>
        <View style={styles.titleContainer}>
          <Text style={[theme.typography.titleMedium, { color: titleColor }]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                theme.typography.bodySmall,
                { color: subtitleColor, marginTop: theme.spacing[4] },
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {actionText && (
          <TouchableOpacity
            onPress={onActionPress}
            disabled={cardProps.disabled || cardProps.loading}
            style={styles.actionButton}
            accessibilityRole="button"
            accessibilityLabel={actionText}
          >
            <Text style={[theme.typography.labelMedium, { color: actionColor }]}>
              {actionText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.body}>{children}</View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  body: {
    width: '100%',
  },
});
