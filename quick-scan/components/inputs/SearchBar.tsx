import React from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';

export interface SearchBarProps extends BaseComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  loading?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  loading = false,
  disabled = false,
  autoFocus = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.customColors.surfaceVariant,
          borderRadius: theme.radius[24],
          paddingHorizontal: theme.spacing[16],
          height: 48,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      testID={testID}
      accessibilityRole="search"
    >
      <Icon
        name="search"
        size={22}
        color={theme.customColors.textSecondary}
        style={{ marginRight: theme.spacing[12] }}
        disabled={disabled}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.customColors.textSecondary}
        editable={!disabled && !loading}
        autoFocus={autoFocus}
        style={[
          styles.input,
          theme.typography.bodyLarge,
          { color: theme.customColors.textPrimary },
        ]}
        accessibilityLabel={accessibilityLabel || placeholder}
      />

      {loading ? (
        <ActivityIndicator size="small" color={theme.customColors.primary} style={styles.trailing} />
      ) : value.length > 0 ? (
        <TouchableOpacity
          onPress={handleClear}
          disabled={disabled || loading}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Icon name="close" size={20} color={theme.customColors.textSecondary} disabled={disabled} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  trailing: {
    marginLeft: 8,
  },
  clearButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
