import { TextStyle, ViewStyle, StyleProp } from 'react-native';
import { MD3Theme } from 'react-native-paper';

export interface ColorPalette {
  primary: string;
  primaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  card: string;
  divider: string;
  outline: string;
  border: string;
  disabled: string;
  shadow: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
}

export type TypographyToken =
  | 'displayLarge'
  | 'displayMedium'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'caption'
  | 'overline';

export type TypographyPalette = Record<TypographyToken, TextStyle>;

export interface ElevationTokens {
  level0: ViewStyle;
  level1: ViewStyle;
  level2: ViewStyle;
  level3: ViewStyle;
  level4: ViewStyle;
  level5: ViewStyle;
}

export interface AppTheme extends MD3Theme {
  customColors: ColorPalette;
  typography: TypographyPalette;
  spacing: Record<number, number>;
  radius: Record<number, number>;
  elevation: ElevationTokens;
  isDark: boolean;
}

export interface BaseComponentProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}
