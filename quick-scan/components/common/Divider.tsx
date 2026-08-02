import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BaseComponentProps } from '../../types/theme';

export interface DividerProps extends BaseComponentProps {
  vertical?: boolean;
  thickness?: number;
  color?: string;
  marginVertical?: number;
  marginHorizontal?: number;
}

export const Divider: React.FC<DividerProps> = ({
  vertical = false,
  thickness = StyleSheet.hairlineWidth,
  color,
  marginVertical = 0,
  marginHorizontal = 0,
  style,
  testID,
}) => {
  const { theme } = useAppTheme();
  const dividerColor = color || theme.customColors.divider;

  return (
    <View
      style={[
        vertical
          ? {
              width: thickness,
              height: '100%',
              backgroundColor: dividerColor,
              marginHorizontal: marginHorizontal || theme.spacing[8],
            }
          : {
              height: thickness,
              width: '100%',
              backgroundColor: dividerColor,
              marginVertical: marginVertical || theme.spacing[8],
            },
        style,
      ]}
      testID={testID}
      accessibilityRole="none"
    />
  );
};
