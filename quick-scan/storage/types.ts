/**
 * QuickScan Studio - Offline Storage System Types & Repository Interfaces
 * Phase 17 Architecture Layer (MMKV Primary Engine)
 */
import {
  SymbologyType,
  HistoryItem,
  FavoriteItem,
  AppSettings,
  PermissionStatus,
  GeneratorData,
  QRCodeType,
  BarcodeType,
} from '../types/domain';

export type ScanSource = 'CAMERA' | 'GALLERY' | 'GENERATOR' | 'MANUAL';

export interface StoredScanItem extends HistoryItem {
  source: ScanSource;
  contentType: string;
  parsedData?: Record<string, any>;
  barcodeFormat?: BarcodeType | string;
  qrType?: QRCodeType | string;
}

export interface StoredFavoriteItem extends FavoriteItem {
  itemData: StoredScanItem;
  notes?: string;
  tagColor?: string;
}

export interface StoredSettings extends AppSettings {
  firstLaunchStatus: boolean;
  onboardingCompleted: boolean;
  permissionStatusCache: Record<string, string>;
}

export interface StoredSearchData {
  recentSearchQueries: string[];
  recentFilters: Record<string, any>;
}

export interface StoredGeneratorItem {
  id: string;
  timestamp: number;
  data: GeneratorData;
  favorite: boolean;
}

export interface StoredGeneratorState {
  recentGenerated: StoredGeneratorItem[];
  recentColors: string[];
  recentCustomizations: Record<string, any>[];
  templates: StoredGeneratorItem[];
}

export interface StorageMetadata {
  version: number;
  lastUpdated: number;
  checksum?: string;
}

export interface IStorageEngine {
  getString(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
  clearAll(): void;
  getAllKeys(): string[];
}

export interface IStorageService {
  getItem<T>(key: string, defaultValue?: T): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<boolean>;
  removeItem(key: string): Promise<boolean>;
  clearAll(): Promise<boolean>;
  getAllKeys(): Promise<string[]>;
  getRaw(key: string): string | null;
  setRaw(key: string, value: string): boolean;
}

export interface IHistoryRepository {
  addRecord(
    item: Omit<StoredScanItem, 'id' | 'timestamp' | 'isFavorite'> & {
      id?: string;
      timestamp?: number;
      isFavorite?: boolean;
    }
  ): Promise<StoredScanItem>;
  getAllRecords(limit?: number, offset?: number): Promise<StoredScanItem[]>;
  getRecordById(id: string): Promise<StoredScanItem | null>;
  deleteRecord(id: string): Promise<boolean>;
  clearHistory(): Promise<boolean>;
  bulkDelete(ids: string[]): Promise<number>;
  bulkUpdate(items: Array<Partial<StoredScanItem> & { id: string }>): Promise<number>;
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<number>;
  count(): Promise<number>;
}

export interface IFavoritesRepository {
  addFavorite(
    scanId: string,
    customLabel?: string,
    notes?: string,
    tagColor?: string,
    fallbackScan?: any
  ): Promise<StoredFavoriteItem | null>;
  removeFavorite(scanId: string): Promise<boolean>;
  updateFavorite(scanId: string, updates: Partial<StoredFavoriteItem>): Promise<StoredFavoriteItem | null>;
  getAllFavorites(): Promise<StoredFavoriteItem[]>;
  isFavorite(scanId: string): Promise<boolean>;
  clearFavorites(): Promise<boolean>;
  count(): Promise<number>;
}

export interface ISettingsRepository {
  getSettings(): Promise<StoredSettings>;
  updateSetting<K extends keyof StoredSettings>(key: K, value: StoredSettings[K]): Promise<StoredSettings>;
  updateSettings(updates: Partial<StoredSettings>): Promise<StoredSettings>;
  resetToDefaults(): Promise<StoredSettings>;
  getPermissionCache(permissionName: string): Promise<string | null>;
  setPermissionCache(permissionName: string, status: string): Promise<void>;
}

export interface IGeneratorRepository {
  saveGeneratedCode(data: GeneratorData): Promise<StoredGeneratorItem>;
  getRecentGenerated(): Promise<StoredGeneratorItem[]>;
  deleteGeneratedCode(id: string): Promise<boolean>;
  clearGeneratedHistory(): Promise<boolean>;
  saveRecentColor(hexColor: string): Promise<string[]>;
  getRecentColors(): Promise<string[]>;
  saveTemplate(data: GeneratorData): Promise<StoredGeneratorItem>;
  getTemplates(): Promise<StoredGeneratorItem[]>;
}

export interface ISearchRepository {
  addSearchQuery(query: string): Promise<string[]>;
  getRecentSearchQueries(): Promise<string[]>;
  clearSearchQueries(): Promise<boolean>;
  saveRecentFilter(filterKey: string, filterValue: any): Promise<void>;
  getRecentFilters(): Promise<Record<string, any>>;
  clearFilters(): Promise<boolean>;
}
