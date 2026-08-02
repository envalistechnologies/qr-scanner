/**
 * QuickScan Studio - Settings & Reactive Localization Provider
 * Phase 19 Architectural State Management (Context + PreferenceRepository Persistence Injection)
 */
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { AppSettings } from '../types/domain';
import { PreferenceRepository, DEFAULT_SETTINGS } from '../storage/repositories/PreferenceRepository';
import { LocalizationService } from '../features/settings/localization/LocalizationService';
import { TranslationKey, DEFAULT_LOCALE } from '../features/settings/localization/dictionaries';

export interface SettingsContextValue {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  isLoaded: boolean;
  // Reactive Localization API
  t: (key: TranslationKey | string, fallback?: string) => string;
  locale: string;
  setLocale: (langCode: string) => Promise<boolean>;
  supportedLanguages: Array<{ code: string; name: string; nativeName: string }>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [locale, setLocaleState] = useState<string>(DEFAULT_LOCALE);

  const prefRepo = useMemo(() => PreferenceRepository.getPreferenceInstance(), []);
  const localization = useMemo(() => LocalizationService.getInstance(), []);

  useEffect(() => {
    const initSettings = async () => {
      try {
        const stored = await prefRepo.getSettings();
        await localization.init();
        setLocaleState(localization.getLocale());
        setSettings(stored);
      } catch (err) {
        console.warn('[SettingsProvider] Error reading initial vault settings, defaulting:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    initSettings();
  }, [prefRepo, localization]);

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> => {
    const updated = await prefRepo.updateSetting(key as any, value as any);
    if (key === 'language' && typeof value === 'string') {
      await localization.setLanguage(value);
      setLocaleState(localization.getLocale());
    }
    setSettings(updated);
  };

  const updateSettings = async (updates: Partial<AppSettings>): Promise<void> => {
    const updated = await prefRepo.updateSettings(updates as any);
    if (updates.language && typeof updates.language === 'string') {
      await localization.setLanguage(updates.language);
      setLocaleState(localization.getLocale());
    }
    setSettings(updated);
  };

  const setLocale = useCallback(
    async (langCode: string): Promise<boolean> => {
      const success = await localization.setLanguage(langCode);
      if (success) {
        setLocaleState(localization.getLocale());
        await prefRepo.updateSetting('language' as any, langCode as any);
      }
      return success;
    },
    [localization, prefRepo]
  );

  const t = useCallback(
    (key: TranslationKey | string, fallback?: string): string => {
      return localization.t(key as any, fallback);
    },
    [localization, locale] // DEPEND ON `locale` SO REACT RE-CALCULATES EVERY STR WHEN LANGUAGE CHANGES!
  );

  const resetToDefaults = async (): Promise<void> => {
    const reset = await prefRepo.resetToDefaults();
    await localization.init();
    setLocaleState(localization.getLocale());
    setSettings(reset);
  };

  const supportedLanguages = useMemo(() => localization.getSupportedLanguages(), [localization]);

  const value = useMemo(
    () => ({
      settings,
      updateSetting,
      updateSettings,
      resetToDefaults,
      isLoaded,
      t,
      locale,
      setLocale,
      supportedLanguages,
    }),
    [settings, isLoaded, t, locale, setLocale, supportedLanguages]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettingsContext(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}
