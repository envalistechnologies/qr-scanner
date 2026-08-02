import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaViewProps } from 'react-native-safe-area-context';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useResponsive } from '../../utils/responsive';
import { BaseComponentProps } from '../../types/theme';

export interface ScreenContainerProps extends BaseComponentProps {
  children: React.ReactNode;
  scrollable?: boolean;
  withSafeArea?: boolean;
  loading?: boolean;
  disabled?: boolean;
  contentContainerStyle?: ViewStyle | ViewStyle[];
  edges?: SafeAreaViewProps['edges'];
  backgroundColor?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = true,
  withSafeArea = true,
  loading = false,
  disabled = false,
  style,
  contentContainerStyle,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor,
  testID,
  accessibilityLabel,
}) => {
  const { theme } = useAppTheme();
  const { horizontalPadding } = useResponsive();
  const containerBgColor = backgroundColor || theme.customColors.background;

  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: containerBgColor,
    opacity: disabled ? 0.7 : 1,
  };

  const contentStyle: ViewStyle = {
    flexGrow: 1,
    paddingHorizontal: horizontalPadding,
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={[styles.loadingContainer, { backgroundColor: containerBgColor }]}>
          <ActivityIndicator size="large" color={theme.customColors.primary} />
        </View>
      );
    }

    if (scrollable) {
      return (
        <ScrollView
          style={[baseStyle, style]}
          contentContainerStyle={[contentStyle, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole="summary"
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View
        style={[baseStyle, contentStyle, style, contentContainerStyle]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="summary"
      >
        {children}
      </View>
    );
  };

  if (withSafeArea) {
    return (
      <SafeAreaView style={baseStyle} edges={edges}>
        {renderContent()}
      </SafeAreaView>
    );
  }

  return renderContent();
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
