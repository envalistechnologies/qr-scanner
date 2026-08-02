/**
 * QuickScan Studio - History Service
 * Refactored in Phase 17: Delegates historical scanning operations to production MMKV HistoryRepository
 */
import { HistoryItem, ScanResult } from '../types/domain';
import { HistoryRepository } from '../storage/repositories/HistoryRepository';

export class HistoryService {
  private static instance: HistoryService;
  private repo: HistoryRepository;

  private constructor() {
    this.repo = HistoryRepository.getInstance();
  }

  public static getInstance(): HistoryService {
    if (!HistoryService.instance) {
      HistoryService.instance = new HistoryService();
    }
    return HistoryService.instance;
  }

  public async getHistory(): Promise<HistoryItem[]> {
    return await this.repo.getAllRecords();
  }

  public async addRecord(scan: ScanResult): Promise<HistoryItem> {
    return await this.repo.addRecord({
      id: scan.id,
      rawValue: scan.rawValue,
      displayTitle: scan.displayTitle,
      symbology: scan.symbology,
      isQR: scan.isQR,
      timestamp: scan.timestamp,
      source: 'CAMERA',
      contentType: scan.symbology || 'TEXT',
    });
  }

  public async deleteRecord(id: string): Promise<void> {
    await this.repo.deleteRecord(id);
  }

  public async clearAllHistory(): Promise<void> {
    await this.repo.clearHistory();
  }

  public async updateRecordTitle(id: string, newTitle: string): Promise<boolean> {
    return await this.repo.updateRecordTitle(id, newTitle);
  }
}
