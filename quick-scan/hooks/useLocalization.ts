/**
 * QuickScan Studio - Reactive Localization Custom Hook
 * Connects any component directly to real-time translation dictionaries and locale state
 */
import { useSettingsContext } from '../providers/SettingsProvider';

export function useLocalization() {
  const { t, locale, setLocale, supportedLanguages } = useSettingsContext();
  return {
    t,
    locale,
    setLocale,
    supportedLanguages,
  };
}
export default useLocalization;
