import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { AppTheme } from '../types/theme';
import { lightColors, darkColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { elevation } from './elevation';

export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  isDark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightColors.primary,
    primaryContainer: lightColors.primaryContainer,
    secondary: lightColors.secondary,
    secondaryContainer: lightColors.secondaryContainer,
    error: lightColors.error,
    background: lightColors.background,
    surface: lightColors.surface,
    surfaceVariant: lightColors.surfaceVariant,
    outline: lightColors.outline,
    elevation: {
      level0: 'transparent',
      level1: lightColors.surface,
      level2: lightColors.surfaceVariant,
      level3: lightColors.surfaceVariant,
      level4: lightColors.surfaceVariant,
      level5: lightColors.surfaceVariant,
    },
  },
  customColors: lightColors,
  typography,
  spacing,
  radius,
  elevation,
};

export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  isDark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    primaryContainer: darkColors.primaryContainer,
    secondary: darkColors.secondary,
    secondaryContainer: darkColors.secondaryContainer,
    error: darkColors.error,
    background: darkColors.background,
    surface: darkColors.surface,
    surfaceVariant: darkColors.surfaceVariant,
    outline: darkColors.outline,
    elevation: {
      level0: 'transparent',
      level1: darkColors.surface,
      level2: darkColors.surfaceVariant,
      level3: darkColors.surfaceVariant,
      level4: darkColors.surfaceVariant,
      level5: darkColors.surfaceVariant,
    },
  },
  customColors: darkColors,
  typography,
  spacing,
  radius,
  elevation,
};
