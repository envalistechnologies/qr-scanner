import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BaseComponentProps } from '../../types/theme';

export interface PageTitleProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  disabled?: boolean;
}

export const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  loading = false,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  const titleColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.textPrimary;
  const subtitleColor = disabled
    ? theme.customColors.disabled
    : theme.customColors.textSecondary;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: theme.spacing[24],
          paddingBottom: theme.spacing[16],
          paddingHorizontal: theme.spacing[16],
        },
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="header"
    >
      <View style={styles.titleRow}>
        <Text
          style={[theme.typography.headlineLarge, { color: titleColor, flex: 1 }]}
          numberOfLines={2}
        >
          {title}
        </Text>
        {loading && (
          <ActivityIndicator
            size="small"
            color={theme.customColors.primary}
            style={{ marginLeft: theme.spacing[12] }}
          />
        )}
      </View>

      {subtitle ? (
        <Text
          style={[
            theme.typography.bodyLarge,
            { color: subtitleColor, marginTop: theme.spacing[8] },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
