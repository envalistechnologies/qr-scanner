/**
 * QuickScan Studio - Favorites Service
 * Refactored in Phase 17: Delegates bookmark operations to production MMKV FavoritesRepository
 */
import { FavoriteItem, ScanResult } from '../types/domain';
import { FavoritesRepository } from '../storage/repositories/FavoritesRepository';
import { generateUUID } from '../utils/strings';

export class FavoritesService {
  private static instance: FavoritesService;
  private repo: FavoritesRepository;

  private constructor() {
    this.repo = FavoritesRepository.getInstance();
  }

  public static getInstance(): FavoritesService {
    if (!FavoritesService.instance) {
      FavoritesService.instance = new FavoritesService();
    }
    return FavoritesService.instance;
  }

  public async getFavorites(): Promise<FavoriteItem[]> {
    return await this.repo.getAllFavorites();
  }

  public async toggleFavorite(scan: ScanResult, label?: string): Promise<FavoriteItem> {
    const isFav = await this.repo.isFavorite(scan.id);
    if (isFav) {
      await this.repo.removeFavorite(scan.id);
      // Return a dummy object to satisfy legacy signature if toggled off
      return {
        id: scan.id,
        scanResultId: scan.id,
        customLabel: label || 'Unfavorited',
        addedTimestamp: Date.now(),
        itemData: scan,
      };
    } else {
      const added = await this.repo.addFavorite(scan.id, label || scan.displayTitle, undefined, undefined, scan);
      if (added) return added;
      return {
        id: generateUUID(),
        scanResultId: scan.id,
        customLabel: label || 'Starred Item',
        addedTimestamp: Date.now(),
        itemData: scan,
      };
    }
  }

  public async removeFavorite(id: string): Promise<void> {
    await this.repo.removeFavorite(id);
  }

  public async updateFavoriteTitle(id: string, newTitle: string): Promise<void> {
    await this.repo.updateFavorite(id, { customLabel: newTitle });
  }

  public async clearFavoritesVault(): Promise<void> {
    await this.repo.clearFavorites();
  }
}
