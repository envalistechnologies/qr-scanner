import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppTheme } from '../types/theme';
import { lightTheme, darkTheme } from '../theme';
import { PreferenceRepository } from '../storage/repositories/PreferenceRepository';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: AppTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  themeMode: 'system',
  setThemeMode: () => {},
  isDark: false,
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  initialMode?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialMode = 'system',
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(initialMode);
  const prefRepo = useMemo(() => PreferenceRepository.getPreferenceInstance(), []);

  useEffect(() => {
    // Phase 19: Restore persisted theme mode from offline preference vault
    const loadPersistedTheme = async () => {
      try {
        const savedMode = await prefRepo.getThemeMode();
        if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
          setThemeModeState(savedMode);
        }
      } catch (err) {
        console.warn('[ThemeProvider] Could not read theme mode from storage vault, using system default:', err);
      }
    };
    loadPersistedTheme();
  }, [prefRepo]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    prefRepo.setThemeMode(mode).catch((err) => {
      console.error('[ThemeProvider] Error persisting theme mode selection:', err);
    });
  }, [prefRepo]);

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const theme: AppTheme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const contextValue = useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode,
      isDark,
    }),
    [theme, themeMode, isDark, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
