/**
 * QuickScan Studio - Offline Import Service Engine
 * Phase 19: Validates and imports JSON vault payloads with zero-crash corrupted file protection
 */
import { HistoryRepository } from '../../storage/repositories/HistoryRepository';
import { FavoritesRepository } from '../../storage/repositories/FavoritesRepository';
import { GeneratorRepository } from '../../storage/repositories/GeneratorRepository';
import { PreferenceRepository } from '../../storage/repositories/PreferenceRepository';
import { StoredScanItem } from '../../storage/types';

export interface ImportResult {
  success: boolean;
  importedCounts: {
    history: number;
    favorites: number;
    generator: number;
    settingsUpdated: boolean;
  };
  error?: string;
}

export class ImportService {
  private static instance: ImportService;
  private historyRepo: HistoryRepository;
  private favoritesRepo: FavoritesRepository;
  private generatorRepo: GeneratorRepository;
  private preferenceRepo: PreferenceRepository;

  private constructor() {
    this.historyRepo = HistoryRepository.getInstance();
    this.favoritesRepo = FavoritesRepository.getInstance();
    this.generatorRepo = GeneratorRepository.getInstance();
    this.preferenceRepo = PreferenceRepository.getPreferenceInstance();
  }

  public static getInstance(): ImportService {
    if (!ImportService.instance) {
      ImportService.instance = new ImportService();
    }
    return ImportService.instance;
  }

  /**
   * Parses, validates, and commits an exported JSON dataset to local offline repositories
   */
  public async importJsonData(jsonString: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      importedCounts: { history: 0, favorites: 0, generator: 0, settingsUpdated: false },
    };

    try {
      if (!jsonString || typeof jsonString !== 'string') {
        result.error = 'Invalid import payload: input must be a formatted JSON string.';
        return result;
      }

      let parsed: any;
      try {
        parsed = JSON.parse(jsonString);
      } catch {
        result.error = 'Corrupted file payload: JSON parsing exception encountered.';
        return result;
      }

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        result.error = 'Invalid file schema: top-level JSON structure must be a data dictionary object.';
        return result;
      }

      // Validate presence of known dataset keys
      const hasHistory = Array.isArray(parsed.history);
      const hasFavorites = Array.isArray(parsed.favorites);
      const hasGenerator = parsed.generator && Array.isArray(parsed.generator.recentGenerated);
      const hasSettings = parsed.settings && typeof parsed.settings === 'object';

      if (!hasHistory && !hasFavorites && !hasGenerator && !hasSettings) {
        result.error = 'Invalid vault format: Missing recognizable QuickScan history, favorites, generator, or settings keys.';
        return result;
      }

      // 1. Process History Imports
      if (hasHistory) {
        for (const item of parsed.history) {
          if (this.isValidHistoryItem(item)) {
            await this.historyRepo.addRecord(item as StoredScanItem, { ignoreDuplicate: true });
            result.importedCounts.history += 1;
          }
        }
      }

      // 2. Process Favorites Imports
      if (hasFavorites) {
        for (const fav of parsed.favorites) {
          if (this.isValidFavoriteItem(fav)) {
            const scanId = fav.scanResultId || fav.id || `imp_${Date.now()}_${Math.random()}`;
            await this.favoritesRepo.addFavorite(scanId, fav.customLabel, fav.notes, fav.tagColor);
            result.importedCounts.favorites += 1;
          }
        }
      }

      // 3. Process Generator Imports
      if (hasGenerator) {
        for (const gen of parsed.generator.recentGenerated) {
          if (gen && gen.data && gen.data.payload) {
            await this.generatorRepo.saveGeneratedCode(gen.data);
            result.importedCounts.generator += 1;
          }
        }
      }

      // 4. Process Settings Imports
      if (hasSettings) {
        const validKeys = [
          'themeMode', 'language', 'animationPreference', 'autoFlash', 'autoScan',
          'duplicateScanDelayMs', 'hapticFeedback', 'audioFeedback', 'vibration',
          'defaultScanMode', 'cameraFacing', 'sound', 'defaultQrType', 'saveHistoryToVault'
        ];
        const safeUpdates: Record<string, any> = {};
        for (const k of validKeys) {
          if (parsed.settings[k] !== undefined) {
            safeUpdates[k] = parsed.settings[k];
          }
        }
        if (Object.keys(safeUpdates).length > 0) {
          await this.preferenceRepo.updateSettings(safeUpdates as any);
          result.importedCounts.settingsUpdated = true;
        }
      }

      result.success = true;
      return result;
    } catch (err: any) {
      console.error('[ImportService] Uncaught exception during data import:', err);
      result.error = err?.message || 'Unexpected system failure while importing vault data.';
      return result;
    }
  }

  private isValidHistoryItem(item: any): boolean {
    return !!(item && typeof item === 'object' && (item.id || item.rawValue));
  }

  private isValidFavoriteItem(item: any): boolean {
    return !!(item && typeof item === 'object' && item.id && (item.itemData || item.scanResultId));
  }
}
