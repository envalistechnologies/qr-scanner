/**
 * QuickScan Studio - Preference Repository
 * Phase 19: Dedicated architectural abstraction for user domain preference persistence and privacy configurations
 */
import { SettingsRepository } from './SettingsRepository';
import { StoredSettings } from '../types';

export { DEFAULT_SETTINGS } from './SettingsRepository';

export class PreferenceRepository extends SettingsRepository {
  private static prefInstance: PreferenceRepository;

  private constructor() {
    super();
  }

  public static getPreferenceInstance(): PreferenceRepository {
    if (!PreferenceRepository.prefInstance) {
      PreferenceRepository.prefInstance = new PreferenceRepository();
    }
    return PreferenceRepository.prefInstance;
  }

  public async getThemeMode(): Promise<'system' | 'light' | 'dark'> {
    const settings = await this.getSettings();
    return settings.themeMode;
  }

  public async setThemeMode(mode: 'system' | 'light' | 'dark'): Promise<StoredSettings> {
    return this.updateSetting('themeMode', mode);
  }

  public async getLanguage(): Promise<string> {
    const settings = await this.getSettings();
    return settings.language;
  }

  public async setLanguage(language: string): Promise<StoredSettings> {
    return this.updateSetting('language', language);
  }
}
