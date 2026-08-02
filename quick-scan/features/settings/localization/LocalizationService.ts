/**
 * QuickScan Studio - Localization Service Engine
 * Phase 19: Offline Multi-Language translation resolution with dynamic runtime switching and safe English fallback
 */
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, TranslationKey, LocaleDictionary } from './dictionaries';
import { PreferenceRepository } from '../../../storage/repositories/PreferenceRepository';

export class LocalizationService {
  private static instance: LocalizationService;
  private currentLocaleCode: string = DEFAULT_LOCALE;
  private prefRepository: PreferenceRepository;

  private constructor() {
    this.prefRepository = PreferenceRepository.getPreferenceInstance();
  }

  public static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  public async init(): Promise<string> {
    try {
      const savedLang = await this.prefRepository.getLanguage();
      if (savedLang && (SUPPORTED_LOCALES[savedLang] || this.normalizeCode(savedLang))) {
        this.currentLocaleCode = this.normalizeCode(savedLang) || DEFAULT_LOCALE;
      } else {
        this.currentLocaleCode = DEFAULT_LOCALE;
      }
    } catch (e) {
      console.warn('[LocalizationService] Error reading language preference, defaulting to English:', e);
      this.currentLocaleCode = DEFAULT_LOCALE;
    }
    return this.currentLocaleCode;
  }

  public getLocale(): string {
    return this.currentLocaleCode;
  }

  public async setLanguage(code: string): Promise<boolean> {
    const normalized = this.normalizeCode(code);
    if (!normalized) {
      console.warn(`[LocalizationService] Unsupported locale "${code}". Fallback retained.`);
      return false;
    }
    this.currentLocaleCode = normalized;
    await this.prefRepository.setLanguage(normalized);
    return true;
  }

  public t(key: TranslationKey | string, defaultText?: string): string {
    const activeDict = SUPPORTED_LOCALES[this.currentLocaleCode] || SUPPORTED_LOCALES[DEFAULT_LOCALE];
    const enDict = SUPPORTED_LOCALES[DEFAULT_LOCALE];

    // 1. Check active language dictionary
    if (activeDict && activeDict.translations[key as TranslationKey]) {
      return activeDict.translations[key as TranslationKey];
    }

    // 2. Safe fallback to English (en-US)
    if (enDict && enDict.translations[key as TranslationKey]) {
      return enDict.translations[key as TranslationKey];
    }

    // 3. Ultimate fallback to supplied default string or original key identifier
    return defaultText || key;
  }

  public getSupportedLanguages(): Array<{ code: string; name: string; nativeName: string }> {
    return Object.keys(SUPPORTED_LOCALES).map((code) => {
      const item = SUPPORTED_LOCALES[code];
      return { code: item.code, name: item.name, nativeName: item.nativeName };
    });
  }

  private normalizeCode(code: string): string | null {
    if (SUPPORTED_LOCALES[code]) return code;
    const short = code.split('-')[0].toLowerCase();
    const match = Object.keys(SUPPORTED_LOCALES).find((k) => k.toLowerCase().startsWith(short));
    return match || null;
  }
}
