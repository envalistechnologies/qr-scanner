import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Image, ImageSource } from 'expo-image';
import { useAppTheme } from '../../hooks/useAppTheme';
import { Icon } from '../icons/Icon';
import { BaseComponentProps } from '../../types/theme';
import { IconName, icons } from '../../theme/icons';

export interface AvatarProps extends BaseComponentProps {
  source?: ImageSource | string;
  initial?: string;
  icon?: keyof typeof icons | IconName;
  size?: 'small' | 'medium' | 'large' | 'xl' | number;
  loading?: boolean;
  disabled?: boolean;
  backgroundColor?: string;
}

const sizeMap = {
  small: 32,
  medium: 48,
  large: 64,
  xl: 96,
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  initial,
  icon = 'user',
  size = 'medium',
  loading = false,
  disabled = false,
  backgroundColor,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();
  const [imgError, setImgError] = useState(false);

  const numericSize = typeof size === 'number' ? size : sizeMap[size];
  const borderRadius = numericSize / 2;

  const bgColor = disabled
    ? theme.customColors.disabled
    : backgroundColor || theme.customColors.primaryContainer;
  const textColor = disabled ? theme.customColors.surface : theme.customColors.primary;

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={textColor} />;
    }

    if (source && !imgError) {
      const imageSource = typeof source === 'string' ? { uri: source } : source;
      return (
        <Image
          source={imageSource}
          style={{ width: numericSize, height: numericSize, borderRadius }}
          onError={() => setImgError(true)}
          contentFit="cover"
        />
      );
    }

    if (initial) {
      const fontSize = numericSize * 0.45;
      return (
        <Text
          style={[
            theme.typography.titleMedium,
            { color: textColor, fontSize, lineHeight: undefined },
          ]}
        >
          {initial.charAt(0).toUpperCase()}
        </Text>
      );
    }

    const iconSize = numericSize * 0.55;
    return <Icon name={icon} size={iconSize} color={textColor} disabled={disabled} />;
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: numericSize,
          height: numericSize,
          borderRadius,
          backgroundColor: bgColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || 'User Avatar'}
    >
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
