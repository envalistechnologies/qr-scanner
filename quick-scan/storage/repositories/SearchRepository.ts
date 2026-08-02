/**
 * QuickScan Studio - Search Repository Implementation
 * Phase 17: Persists Recent Search History and Category/Symbology Filter Caches with LRU Capping
 */
import { ISearchRepository, StoredSearchData } from '../types';
import { StorageService } from '../StorageService';

const DEFAULT_SEARCH_DATA: StoredSearchData = {
  recentSearchQueries: [],
  recentFilters: {
    symbologies: [],
    dateRange: 'ALL',
    sortBy: 'DATE_DESC',
  },
};

export class SearchRepository implements ISearchRepository {
  private static instance: SearchRepository;
  private static readonly KEY_SEARCH = 'search_data_vault';
  private storage: StorageService;
  private inMemoryData: StoredSearchData | null = null;

  private constructor() {
    this.storage = StorageService.getInstance();
  }

  public static getInstance(): SearchRepository {
    if (!SearchRepository.instance) {
      SearchRepository.instance = new SearchRepository();
    }
    return SearchRepository.instance;
  }

  private async loadData(): Promise<StoredSearchData> {
    if (this.inMemoryData !== null) {
      return this.inMemoryData;
    }
    const data = await this.storage.getItem<StoredSearchData>(SearchRepository.KEY_SEARCH, DEFAULT_SEARCH_DATA);
    this.inMemoryData = { ...DEFAULT_SEARCH_DATA, ...(data || {}) };
    return this.inMemoryData;
  }

  private async saveData(data: StoredSearchData): Promise<boolean> {
    this.inMemoryData = data;
    return await this.storage.setItem(SearchRepository.KEY_SEARCH, data);
  }

  public async addSearchQuery(query: string): Promise<string[]> {
    const data = await this.loadData();
    const cleanQuery = query.trim();
    if (!cleanQuery) return data.recentSearchQueries;

    // Remove duplicates and prepend (LRU mechanism)
    const filtered = data.recentSearchQueries.filter((q) => q.toLowerCase() !== cleanQuery.toLowerCase());
    const updatedQueries = [cleanQuery, ...filtered].slice(0, 30); // Cap at 30 queries
    await this.saveData({ ...data, recentSearchQueries: updatedQueries });
    return updatedQueries;
  }

  public async getRecentSearchQueries(): Promise<string[]> {
    const data = await this.loadData();
    return [...data.recentSearchQueries];
  }

  public async clearSearchQueries(): Promise<boolean> {
    const data = await this.loadData();
    await this.saveData({ ...data, recentSearchQueries: [] });
    return true;
  }

  public async saveRecentFilter(filterKey: string, filterValue: any): Promise<void> {
    const data = await this.loadData();
    const updatedFilters = { ...(data.recentFilters || {}), [filterKey]: filterValue };
    await this.saveData({ ...data, recentFilters: updatedFilters });
  }

  public async getRecentFilters(): Promise<Record<string, any>> {
    const data = await this.loadData();
    return { ...data.recentFilters };
  }

  public async clearFilters(): Promise<boolean> {
    const data = await this.loadData();
    await this.saveData({ ...data, recentFilters: DEFAULT_SEARCH_DATA.recentFilters });
    return true;
  }

  public clearMemoryCache(): void {
    this.inMemoryData = null;
  }
}
