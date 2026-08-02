/**
 * QuickScan Studio - Master Settings & Preferences Service
 * Phase 19: Unified orchestration engine for preferences, localization, data purging, resets, and privacy controls
 */
import { PreferenceRepository } from '../../storage/repositories/PreferenceRepository';
import { HistoryRepository } from '../../storage/repositories/HistoryRepository';
import { FavoritesRepository } from '../../storage/repositories/FavoritesRepository';
import { GeneratorRepository } from '../../storage/repositories/GeneratorRepository';
import { SearchRepository } from '../../storage/repositories/SearchRepository';
import { LocalizationService } from './localization/LocalizationService';
import { ExportService } from './ExportService';
import { ImportService } from './ImportService';
import { BackupService } from './BackupService';
import { StoredSettings } from '../../storage/types';
import { PlatformHandlers } from '../actions/PlatformHandlers';

export class SettingsService {
  private static instance: SettingsService;
  private prefRepo: PreferenceRepository;
  private historyRepo: HistoryRepository;
  private favoritesRepo: FavoritesRepository;
  private generatorRepo: GeneratorRepository;
  private searchRepo: SearchRepository;
  private localization: LocalizationService;
  private exportSvc: ExportService;
  private importSvc: ImportService;
  private backupSvc: BackupService;

  private constructor() {
    this.prefRepo = PreferenceRepository.getPreferenceInstance();
    this.historyRepo = HistoryRepository.getInstance();
    this.favoritesRepo = FavoritesRepository.getInstance();
    this.generatorRepo = GeneratorRepository.getInstance();
    this.searchRepo = SearchRepository.getInstance();
    this.localization = LocalizationService.getInstance();
    this.exportSvc = ExportService.getInstance();
    this.importSvc = ImportService.getInstance();
    this.backupSvc = BackupService.getInstance();
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  // --- Preference Getters & Setters ---
  public async getSettings(): Promise<StoredSettings> {
    return await this.prefRepo.getSettings();
  }

  public async updateSetting<K extends keyof StoredSettings>(key: K, value: StoredSettings[K]): Promise<StoredSettings> {
    return await this.prefRepo.updateSetting(key, value);
  }

  public async updateSettings(updates: Partial<StoredSettings>): Promise<StoredSettings> {
    return await this.prefRepo.updateSettings(updates);
  }

  // --- Theme & Appearance ---
  public async getThemeMode(): Promise<'system' | 'light' | 'dark'> {
    return await this.prefRepo.getThemeMode();
  }

  public async setThemeMode(mode: 'system' | 'light' | 'dark'): Promise<StoredSettings> {
    const updated = await this.prefRepo.setThemeMode(mode);
    PlatformHandlers.triggerSuccessHaptic();
    return updated;
  }

  // --- Localization & Language ---
  public async setLanguage(langCode: string): Promise<boolean> {
    const res = await this.localization.setLanguage(langCode);
    if (res) {
      PlatformHandlers.triggerSuccessHaptic();
    }
    return res;
  }

  public getLocale(): string {
    return this.localization.getLocale();
  }

  public t(key: string, fallback?: string): string {
    return this.localization.t(key, fallback);
  }

  // --- Data Management Purges ---
  public async clearHistory(): Promise<boolean> {
    try {
      const res = await this.historyRepo.clearHistory();
      PlatformHandlers.triggerSuccessHaptic();
      return res;
    } catch (e) {
      console.error('[SettingsService] Failed to clear history:', e);
      return false;
    }
  }

  public async clearFavorites(): Promise<boolean> {
    try {
      const res = await this.favoritesRepo.clearFavorites();
      PlatformHandlers.triggerSuccessHaptic();
      return res;
    } catch (e) {
      console.error('[SettingsService] Failed to clear favorites:', e);
      return false;
    }
  }

  public async clearRecentSearches(): Promise<boolean> {
    try {
      const p1 = await this.searchRepo.clearSearchQueries();
      const p2 = await this.searchRepo.clearFilters();
      PlatformHandlers.triggerSuccessHaptic();
      return p1 && p2;
    } catch (e) {
      console.error('[SettingsService] Failed to clear recent searches:', e);
      return false;
    }
  }

  public async clearGeneratedQrHistory(): Promise<boolean> {
    try {
      const res = await this.generatorRepo.clearGeneratedHistory();
      PlatformHandlers.triggerSuccessHaptic();
      return res;
    } catch (e) {
      console.error('[SettingsService] Failed to clear generated QR history:', e);
      return false;
    }
  }

  // --- Resets ---
  public async resetSettings(): Promise<StoredSettings> {
    try {
      const reset = await this.prefRepo.resetToDefaults();
      await this.localization.init();
      PlatformHandlers.triggerSuccessHaptic();
      return reset;
    } catch (err) {
      console.error('[SettingsService] Error resetting settings:', err);
      return await this.prefRepo.getSettings();
    }
  }

  public async factoryReset(): Promise<boolean> {
    try {
      // 1. Reset user preferences & theme
      await this.prefRepo.resetToDefaults();
      await this.localization.init();

      // 2. Erase all data vaults
      await this.historyRepo.clearHistory();
      await this.favoritesRepo.clearFavorites();
      await this.generatorRepo.clearGeneratedHistory();
      await this.searchRepo.clearSearchQueries();
      await this.searchRepo.clearFilters();

      // 3. Purge backup archives and memory caches
      await this.backupSvc.deleteLocalBackup();
      this.prefRepo.clearMemoryCache();

      PlatformHandlers.triggerErrorHaptic();
      return true;
    } catch (err) {
      console.error('[SettingsService] Exception during factory reset:', err);
      return false;
    }
  }

  // --- Sub-engine Accessors ---
  public getExportEngine(): ExportService {
    return this.exportSvc;
  }

  public getImportEngine(): ImportService {
    return this.importSvc;
  }

  public getBackupEngine(): BackupService {
    return this.backupSvc;
  }

  public getLocalizationEngine(): LocalizationService {
    return this.localization;
  }
}
