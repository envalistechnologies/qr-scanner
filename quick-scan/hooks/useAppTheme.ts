import { useThemeContext, ThemeContextType } from '../providers/ThemeProvider';
import { AppTheme } from '../types/theme';

export const useAppTheme = (): ThemeContextType & { theme: AppTheme } => {
  const context = useThemeContext();
  return {
    ...context,
    theme: context.theme,
  };
};
