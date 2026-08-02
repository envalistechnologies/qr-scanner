import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { icons, IconName } from '../../theme/icons';
import { BaseComponentProps } from '../../types/theme';

export interface IconProps extends BaseComponentProps {
  name: keyof typeof icons | IconName;
  size?: number;
  color?: string;
  disabled?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();
  const iconGlyph = (icons[name as keyof typeof icons] ?? name) as IconName;
  const iconColor = disabled
    ? theme.customColors.disabled
    : color || theme.customColors.textPrimary;

  return (
    <MaterialCommunityIcons
      name={iconGlyph}
      size={size}
      color={iconColor}
      style={style as any}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image"
    />
  );
};
