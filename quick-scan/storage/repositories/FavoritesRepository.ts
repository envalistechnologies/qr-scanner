/**
 * QuickScan Studio - Favorites Repository Implementation
 * Phase 17: Persists Bookmarked Scans with O(1) Lookup Hashing and Custom Metadata
 */
import { IFavoritesRepository, StoredFavoriteItem, StoredScanItem } from '../types';
import { StorageService } from '../StorageService';
import { HistoryRepository } from './HistoryRepository';
import { generateUUID } from '../../utils/strings';

export class FavoritesRepository implements IFavoritesRepository {
  private static instance: FavoritesRepository;
  private static readonly KEY_FAVORITES = 'favorites_vault';
  private storage: StorageService;
  private inMemoryList: StoredFavoriteItem[] | null = null;
  private lookupSet: Set<string> | null = null;

  private constructor() {
    this.storage = StorageService.getInstance();
  }

  public static getInstance(): FavoritesRepository {
    if (!FavoritesRepository.instance) {
      FavoritesRepository.instance = new FavoritesRepository();
    }
    return FavoritesRepository.instance;
  }

  private async loadCache(): Promise<StoredFavoriteItem[]> {
    if (this.inMemoryList !== null && this.lookupSet !== null) {
      return this.inMemoryList;
    }
    const data = await this.storage.getItem<StoredFavoriteItem[]>(FavoritesRepository.KEY_FAVORITES, []);
    this.inMemoryList = Array.isArray(data) ? data : [];
    this.lookupSet = new Set(this.inMemoryList.map((item) => item.scanResultId));
    return this.inMemoryList;
  }

  private async saveCache(data: StoredFavoriteItem[]): Promise<boolean> {
    this.inMemoryList = data;
    this.lookupSet = new Set(data.map((item) => item.scanResultId));
    const res = await this.storage.setItem(FavoritesRepository.KEY_FAVORITES, data);
    this.storage.notifyVaultChange();
    return res;
  }

  public async addFavorite(
    scanId: string,
    customLabel?: string,
    notes?: string,
    tagColor?: string,
    fallbackScan?: any
  ): Promise<StoredFavoriteItem | null> {
    const list = await this.loadCache();
    if (this.lookupSet!.has(scanId)) {
      // Already favorited; perform update instead
      return this.updateFavorite(scanId, { customLabel, notes, tagColor });
    }

    // Retrieve corresponding item from HistoryRepository or build standalone record
    const historyRepo = HistoryRepository.getInstance();
    let scanData: StoredScanItem | null = await historyRepo.getRecordById(scanId);

    if (!scanData && fallbackScan) {
      scanData = {
        id: fallbackScan.id || scanId,
        rawValue: fallbackScan.rawValue || customLabel || scanId,
        displayTitle: fallbackScan.displayTitle || customLabel || 'Bookmarked Item',
        symbology: fallbackScan.symbology || 'UNKNOWN',
        isQR: fallbackScan.isQR ?? true,
        timestamp: fallbackScan.timestamp || Date.now(),
        isFavorite: true,
        source: fallbackScan.source || 'MANUAL',
        contentType: fallbackScan.contentType || fallbackScan.symbology || 'PLAIN_TEXT',
      };
    } else if (!scanData) {
      // Create fallback record if scan was previously deleted or standalone
      scanData = {
        id: scanId,
        rawValue: customLabel || scanId,
        displayTitle: customLabel || 'Bookmarked Item',
        symbology: 'UNKNOWN',
        isQR: true,
        timestamp: Date.now(),
        isFavorite: true,
        source: 'MANUAL',
        contentType: 'PLAIN_TEXT',
      };
    } else {
      // Keep History item in sync
      await historyRepo.updateFavoriteStatus(scanId, true);
    }

    const newFav: StoredFavoriteItem = {
      id: generateUUID(),
      scanResultId: scanId,
      itemData: { ...scanData, isFavorite: true },
      customLabel: customLabel || scanData.displayTitle,
      notes: notes || '',
      tagColor: tagColor || '#3B82F6',
      addedTimestamp: Date.now(),
    };

    const updated = [newFav, ...list];
    await this.saveCache(updated);
    return newFav;
  }

  public async removeFavorite(scanId: string, skipHistorySync?: boolean): Promise<boolean> {
    const list = await this.loadCache();
    const targetItem = list.find((item) => item.scanResultId === scanId || item.id === scanId);
    if (!targetItem && skipHistorySync) {
      return false;
    }

    const filtered = list.filter((item) => item.scanResultId !== scanId && item.id !== scanId);
    await this.saveCache(filtered);

    const historyRepo = HistoryRepository.getInstance();
    await historyRepo.updateFavoriteStatus(targetItem ? targetItem.scanResultId : scanId, false);
    if (!skipHistorySync) {
      await historyRepo.deleteRecord(targetItem ? targetItem.scanResultId : scanId, true);
    }

    return true;
  }

  public async updateFavorite(scanId: string, updates: Partial<StoredFavoriteItem>, skipHistorySync?: boolean): Promise<StoredFavoriteItem | null> {
    const list = await this.loadCache();
    let updatedItem: StoredFavoriteItem | null = null;

    const modified = list.map((item) => {
      if (item.scanResultId === scanId || item.id === scanId) {
        updatedItem = { ...item, ...updates };
        return updatedItem;
      }
      return item;
    });

    if (updatedItem) {
      await this.saveCache(modified);
      if (!skipHistorySync && updates.customLabel) {
        const historyRepo = HistoryRepository.getInstance();
        await historyRepo.updateRecordTitle(scanId, updates.customLabel, true);
      }
    }
    return updatedItem;
  }

  public async updateFavoriteTitleSync(scanId: string, newTitle: string, skipHistorySync?: boolean): Promise<StoredFavoriteItem | null> {
    return this.updateFavorite(scanId, { customLabel: newTitle }, skipHistorySync);
  }

  public async getAllFavorites(): Promise<StoredFavoriteItem[]> {
    const list = await this.loadCache();
    return [...list];
  }

  public async isFavorite(scanId: string): Promise<boolean> {
    await this.loadCache();
    return this.lookupSet!.has(scanId);
  }

  public async clearFavorites(skipHistorySync?: boolean): Promise<boolean> {
    await this.saveCache([]);
    if (!skipHistorySync) {
      const historyRepo = HistoryRepository.getInstance();
      await historyRepo.clearHistory(true);
    }
    return true;
  }

  public async count(): Promise<number> {
    const list = await this.loadCache();
    return list.length;
  }

  public clearMemoryCache(): void {
    this.inMemoryList = null;
    this.lookupSet = null;
  }
}
