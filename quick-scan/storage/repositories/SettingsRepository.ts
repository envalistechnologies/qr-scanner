/**
 * QuickScan Studio - Preference & Settings Repository Implementation
 * Phase 19: Persists User Preferences, Theme, Language, Privacy toggles, and Permission Cache with Safe Defaults & Zero Redundant IO
 */
import { ISettingsRepository, StoredSettings } from '../types';
import { StorageService } from '../StorageService';

export const DEFAULT_SETTINGS: StoredSettings = {
  // Theme & Appearance
  themeMode: 'system',
  language: 'en-US',
  animationPreference: true,

  // Scan Engine Preferences
  autoFlash: false,
  autoScan: true,
  duplicateScanDelayMs: 1500,
  hapticFeedback: true,
  audioFeedback: true,
  vibration: true,
  defaultScanMode: 'AUTO',
  cameraFacing: 'back',
  sound: true,

  // Generator Studio Preferences
  defaultQrType: 'URL',
  defaultQrSize: 200,
  defaultQrMargin: 4,
  defaultQrForeground: '#000000',
  defaultQrBackground: '#FFFFFF',
  defaultQrErrorCorrection: 'M',

  // Privacy & Storage Preferences
  saveHistoryToVault: true,
  analyticsToggle: false,
  crashReportingToggle: false,

  // Lifecycle metadata
  firstLaunchStatus: true,
  onboardingCompleted: false,
  permissionStatusCache: {},
};

export class SettingsRepository implements ISettingsRepository {
  private static instance: SettingsRepository;
  private static readonly KEY_SETTINGS = 'app_settings_vault';
  private storage: StorageService;
  private inMemorySettings: StoredSettings | null = null;
  private isInitializing: Promise<StoredSettings> | null = null;

  protected constructor() {
    this.storage = StorageService.getInstance();
  }

  public static getInstance(): SettingsRepository {
    if (!SettingsRepository.instance) {
      SettingsRepository.instance = new SettingsRepository();
    }
    return SettingsRepository.instance;
  }

  public async getSettings(): Promise<StoredSettings> {
    if (this.inMemorySettings !== null) {
      return this.inMemorySettings;
    }
    if (this.isInitializing) {
      return this.isInitializing;
    }

    this.isInitializing = (async () => {
      try {
        const data = await this.storage.getItem<StoredSettings>(SettingsRepository.KEY_SETTINGS, DEFAULT_SETTINGS);
        // Merge with default configurations to protect against schema evolution or missing keys
        this.inMemorySettings = { ...DEFAULT_SETTINGS, ...(data || {}) };
      } catch (err) {
        console.warn('[SettingsRepository] Failed to read vault, loading default preferences:', err);
        this.inMemorySettings = { ...DEFAULT_SETTINGS };
      } finally {
        this.isInitializing = null;
      }
      return this.inMemorySettings;
    })();

    return this.isInitializing;
  }

  public async updateSetting<K extends keyof StoredSettings>(key: K, value: StoredSettings[K]): Promise<StoredSettings> {
    const current = await this.getSettings();
    // Prevent redundant IO disk writes if setting value is unchanged
    if (current[key] === value && typeof value !== 'object') {
      return current;
    }

    const updated: StoredSettings = { ...current, [key]: value };
    this.inMemorySettings = updated;
    try {
      await this.storage.setItem(SettingsRepository.KEY_SETTINGS, updated);
    } catch (err) {
      console.error(`[SettingsRepository] IO exception saving setting ${String(key)}:`, err);
    }
    return updated;
  }

  public async updateSettings(updates: Partial<StoredSettings>): Promise<StoredSettings> {
    const current = await this.getSettings();
    let hasChanges = false;
    for (const k of Object.keys(updates) as Array<keyof StoredSettings>) {
      if (current[k] !== updates[k]) {
        hasChanges = true;
        break;
      }
    }
    if (!hasChanges) {
      return current;
    }

    const updated: StoredSettings = { ...current, ...updates };
    this.inMemorySettings = updated;
    try {
      await this.storage.setItem(SettingsRepository.KEY_SETTINGS, updated);
    } catch (err) {
      console.error('[SettingsRepository] IO exception updating batch settings:', err);
    }
    return updated;
  }

  public async resetToDefaults(): Promise<StoredSettings> {
    this.inMemorySettings = { ...DEFAULT_SETTINGS };
    try {
      await this.storage.setItem(SettingsRepository.KEY_SETTINGS, this.inMemorySettings);
    } catch (err) {
      console.error('[SettingsRepository] IO exception resetting settings to defaults:', err);
    }
    return this.inMemorySettings;
  }

  public async getPermissionCache(permissionName: string): Promise<string | null> {
    const settings = await this.getSettings();
    return settings.permissionStatusCache?.[permissionName] || null;
  }

  public async setPermissionCache(permissionName: string, status: string): Promise<void> {
    const settings = await this.getSettings();
    const updatedCache = { ...(settings.permissionStatusCache || {}), [permissionName]: status };
    await this.updateSetting('permissionStatusCache', updatedCache);
  }

  public clearMemoryCache(): void {
    this.inMemorySettings = null;
  }
}
