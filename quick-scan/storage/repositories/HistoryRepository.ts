/**
 * QuickScan Studio - History Repository Implementation
 * Phase 17: Persists Optical Scans with Duplicate Guard and Pagination Support
 */
import { IHistoryRepository, StoredScanItem } from '../types';
import { StorageService } from '../StorageService';
import { generateUUID } from '../../utils/strings';

export class HistoryRepository implements IHistoryRepository {
  private static instance: HistoryRepository;
  private static readonly KEY_HISTORY = 'scan_history_vault';
  private storage: StorageService;
  private inMemoryCache: StoredScanItem[] | null = null;

  private constructor() {
    this.storage = StorageService.getInstance();
  }

  public static getInstance(): HistoryRepository {
    if (!HistoryRepository.instance) {
      HistoryRepository.instance = new HistoryRepository();
    }
    return HistoryRepository.instance;
  }

  private async loadCache(): Promise<StoredScanItem[]> {
    if (this.inMemoryCache !== null) {
      return this.inMemoryCache;
    }
    const data = await this.storage.getItem<StoredScanItem[]>(HistoryRepository.KEY_HISTORY, []);
    this.inMemoryCache = Array.isArray(data) ? data : [];
    return this.inMemoryCache;
  }

  private async saveCache(data: StoredScanItem[]): Promise<boolean> {
    this.inMemoryCache = data;
    const res = await this.storage.setItem(HistoryRepository.KEY_HISTORY, data);
    this.storage.notifyVaultChange();
    return res;
  }

  public async addRecord(
    item: Omit<StoredScanItem, 'id' | 'timestamp' | 'isFavorite'> & {
      id?: string;
      timestamp?: number;
      isFavorite?: boolean;
    },
    options?: { cooldownMs?: number; ignoreDuplicate?: boolean }
  ): Promise<StoredScanItem> {
    const records = await this.loadCache();
    const now = item.timestamp || Date.now();
    const cooldown = options?.cooldownMs ?? 5000; // default 5s duplicate prevention

    if (!options?.ignoreDuplicate) {
      // Prevent duplicate scans within the cooldown timeframe
      const recentDuplicate = records.find(
        (r) => r.rawValue === item.rawValue && r.symbology === item.symbology && now - r.timestamp < cooldown
      );
      if (recentDuplicate) {
        // Return existing record without duplicating in database
        return recentDuplicate;
      }
    }

    const newRecord: StoredScanItem = {
      id: item.id || generateUUID(),
      rawValue: item.rawValue,
      displayTitle: item.displayTitle,
      symbology: item.symbology || 'UNKNOWN',
      isQR: item.isQR ?? true,
      timestamp: now,
      isFavorite: item.isFavorite ?? false,
      source: item.source || 'CAMERA',
      contentType: item.contentType || 'PLAIN_TEXT',
      parsedData: item.parsedData || {},
      barcodeFormat: item.barcodeFormat || item.symbology || 'TEXT',
      qrType: item.qrType || 'TEXT',
      metadata: item.metadata || {},
    };

    // Prepend to list (latest first)
    const updated = [newRecord, ...records];
    await this.saveCache(updated);
    return newRecord;
  }

  // Optimized batch insertion for 10,000 record stress testing benchmarks
  public async batchInsert(items: StoredScanItem[]): Promise<number> {
    const records = await this.loadCache();
    const combined = [...items, ...records];
    await this.saveCache(combined);
    return items.length;
  }

  public async getAllRecords(limit?: number, offset?: number): Promise<StoredScanItem[]> {
    const records = await this.loadCache();
    if (limit !== undefined && offset !== undefined) {
      return records.slice(offset, offset + limit);
    } else if (limit !== undefined) {
      return records.slice(0, limit);
    }
    return [...records];
  }

  public async getRecordById(id: string): Promise<StoredScanItem | null> {
    const records = await this.loadCache();
    return records.find((r) => r.id === id) || null;
  }

  public async deleteRecord(id: string, skipFavSync?: boolean): Promise<boolean> {
    const records = await this.loadCache();
    const filtered = records.filter((r) => r.id !== id);
    if (filtered.length === records.length && skipFavSync) {
      return false;
    }
    await this.saveCache(filtered);

    if (!skipFavSync) {
      try {
        const { FavoritesRepository } = require('./FavoritesRepository');
        await FavoritesRepository.getInstance().removeFavorite(id, true);
      } catch (e) {
        console.error('[HistoryRepository] Failed sync deletion to Favorites:', e);
      }
    }

    return true;
  }

  public async clearHistory(skipFavSync?: boolean): Promise<boolean> {
    await this.saveCache([]);
    if (!skipFavSync) {
      try {
        const { FavoritesRepository } = require('./FavoritesRepository');
        await FavoritesRepository.getInstance().clearFavorites(true);
      } catch (e) {}
    }
    return true;
  }

  public async bulkDelete(ids: string[], skipFavSync?: boolean): Promise<number> {
    const records = await this.loadCache();
    const idSet = new Set(ids);
    const initialCount = records.length;
    const remaining = records.filter((r) => !idSet.has(r.id));
    await this.saveCache(remaining);
    if (!skipFavSync) {
      try {
        const { FavoritesRepository } = require('./FavoritesRepository');
        for (const id of ids) {
          await FavoritesRepository.getInstance().removeFavorite(id, true);
        }
      } catch (e) {}
    }
    return initialCount - remaining.length;
  }

  public async bulkUpdate(items: Array<Partial<StoredScanItem> & { id: string }>): Promise<number> {
    const records = await this.loadCache();
    const updateMap = new Map(items.map((i) => [i.id, i]));
    let updatedCount = 0;

    const modified = records.map((r) => {
      if (updateMap.has(r.id)) {
        updatedCount++;
        return { ...r, ...updateMap.get(r.id)! };
      }
      return r;
    });

    if (updatedCount > 0) {
      await this.saveCache(modified);
    }
    return updatedCount;
  }

  public async exportData(): Promise<string> {
    const records = await this.loadCache();
    return JSON.stringify({ version: 1, exportedAt: Date.now(), total: records.length, data: records });
  }

  public async importData(jsonData: string): Promise<number> {
    try {
      const parsed = JSON.parse(jsonData);
      const importedRecords: StoredScanItem[] = Array.isArray(parsed.data) ? parsed.data : Array.isArray(parsed) ? parsed : [];
      if (importedRecords.length === 0) return 0;

      const existing = await this.loadCache();
      const existingIds = new Set(existing.map((e) => e.id));
      const newAdditions = importedRecords.filter((i) => !existingIds.has(i.id));

      if (newAdditions.length > 0) {
        await this.saveCache([...newAdditions, ...existing]);
      }
      return newAdditions.length;
    } catch (e) {
      console.error('[HistoryRepository] Failed importing JSON archive:', e);
      return 0;
    }
  }

  public async count(): Promise<number> {
    const records = await this.loadCache();
    return records.length;
  }

  public async updateFavoriteStatus(scanId: string, isFavorite: boolean): Promise<boolean> {
    const records = await this.loadCache();
    let found = false;
    const updated = records.map((r) => {
      if (r.id === scanId) {
        found = true;
        return { ...r, isFavorite };
      }
      return r;
    });
    if (found) {
      await this.saveCache(updated);
    }
    return found;
  }

  public async updateRecordTitle(scanId: string, newTitle: string, skipFavSync?: boolean): Promise<boolean> {
    const records = await this.loadCache();
    let found = false;
    const updated = records.map((r) => {
      if (r.id === scanId) {
        found = true;
        return { ...r, displayTitle: newTitle };
      }
      return r;
    });
    if (found) {
      await this.saveCache(updated);
    }
    if (!skipFavSync) {
      try {
        const { FavoritesRepository } = require('./FavoritesRepository');
        await FavoritesRepository.getInstance().updateFavoriteTitleSync(scanId, newTitle, true);
      } catch (e) {}
    }
    return found;
  }

  public clearMemoryCache(): void {
    this.inMemoryCache = null;
  }
}
