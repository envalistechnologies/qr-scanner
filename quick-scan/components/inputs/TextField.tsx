import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle, StyleProp } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { IconName, icons } from '../../theme/icons';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  leadingIcon?: keyof typeof icons | IconName;
  helperText?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  leadingIcon,
  helperText,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  containerStyle,
  testID,
  ...restProps
}) => {
  const { theme } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = isFocused
    ? theme.customColors.primary
    : disabled
    ? theme.customColors.divider
    : theme.customColors.outline;

  const backgroundColor = disabled
    ? theme.customColors.surfaceVariant
    : theme.customColors.surface;

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label && (
        <Text
          style={[
            theme.typography.labelMedium,
            { color: disabled ? theme.customColors.textDisabled : theme.customColors.textPrimary, marginBottom: theme.spacing[6] },
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor,
            borderColor,
            borderWidth: isFocused ? 1.5 : 1,
            borderRadius: theme.radius[12],
            minHeight: multiline ? 96 : 52,
            paddingHorizontal: theme.spacing[16],
            paddingVertical: multiline ? theme.spacing[12] : 0,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        {leadingIcon && (
          <View style={[styles.iconWrap, { marginRight: theme.spacing[12], marginTop: multiline ? 2 : 0 }]}>
            <Icon
              name={leadingIcon}
              size={22}
              color={isFocused ? theme.customColors.primary : theme.customColors.textSecondary}
            />
          </View>
        )}

        <TextInput
          style={[
            styles.textInput,
            theme.typography.bodyMedium,
            {
              color: disabled ? theme.customColors.textDisabled : theme.customColors.textPrimary,
              textAlignVertical: multiline ? 'top' : 'center',
            },
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.customColors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label || placeholder}
          {...restProps}
        />
      </View>

      {helperText && (
        <Text
          style={[
            theme.typography.bodySmall,
            { color: theme.customColors.textSecondary, marginTop: theme.spacing[4] },
          ]}
        >
          {helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  iconWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
});
