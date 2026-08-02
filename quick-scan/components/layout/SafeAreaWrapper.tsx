import React from 'react';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BaseComponentProps } from '../../types/theme';

export interface SafeAreaWrapperProps extends BaseComponentProps {
  children: React.ReactNode;
  edges?: SafeAreaViewProps['edges'];
  backgroundColor?: string;
  disabled?: boolean;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();
  const bgColor = backgroundColor || theme.customColors.background;

  return (
    <SafeAreaView
      style={[
        { flex: 1, backgroundColor: bgColor, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
      edges={edges}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </SafeAreaView>
  );
};
