/**
 * QuickScan Studio - Local Offline Backup Service Engine
 * Phase 19: Architecture for 100% device-local vault backup and transactional recovery without cloud sync
 */
import { StorageService } from '../../storage/StorageService';
import { ExportService } from './ExportService';
import { ImportService, ImportResult } from './ImportService';

export interface BackupMetadata {
  exists: boolean;
  timestamp?: number;
  isoDate?: string;
  recordCount?: number;
  schemaVersion?: string;
  checksum?: string;
}

interface StoredBackupPayload {
  meta: {
    timestamp: number;
    isoDate: string;
    recordCount: number;
    schemaVersion: string;
    checksum: string;
  };
  jsonDump: string;
}

export class BackupService {
  private static instance: BackupService;
  private static readonly KEY_BACKUP_VAULT = 'quickscan_offline_master_backup';
  private storage: StorageService;
  private exportService: ExportService;
  private importService: ImportService;

  private constructor() {
    this.storage = StorageService.getInstance();
    this.exportService = ExportService.getInstance();
    this.importService = ImportService.getInstance();
  }

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  /**
   * Generates an atomic offline snapshot of all repositories and stores it in a dedicated fallback vault
   */
  public async createLocalBackup(): Promise<{ success: boolean; metadata?: BackupMetadata; error?: string }> {
    try {
      const exportRes = await this.exportService.exportToJson({
        history: true,
        favorites: true,
        generator: true,
        settings: true,
      });

      if (!exportRes.success || !exportRes.data) {
        return { success: false, error: exportRes.error || 'Failed to assemble export snapshot for backup.' };
      }

      const timestamp = Date.now();
      const isoDate = new Date(timestamp).toISOString();
      const checksum = this.computeSimpleHash(exportRes.data);

      const payload: StoredBackupPayload = {
        meta: {
          timestamp,
          isoDate,
          recordCount: exportRes.recordCount,
          schemaVersion: '3.4.0',
          checksum,
        },
        jsonDump: exportRes.data,
      };

      await this.storage.setItem(BackupService.KEY_BACKUP_VAULT, payload);

      return {
        success: true,
        metadata: {
          exists: true,
          timestamp,
          isoDate,
          recordCount: exportRes.recordCount,
          schemaVersion: '3.4.0',
          checksum,
        },
      };
    } catch (err: any) {
      console.error('[BackupService] Exception during local backup creation:', err);
      return { success: false, error: err?.message || 'Unexpected exception saving backup snapshot.' };
    }
  }

  /**
   * Reads current backup archive metadata without deserializing the entire database
   */
  public async getLatestBackupMeta(): Promise<BackupMetadata> {
    try {
      const saved = await this.storage.getItem<StoredBackupPayload>(BackupService.KEY_BACKUP_VAULT, null as any);
      if (!saved || !saved.meta) {
        return { exists: false };
      }
      return {
        exists: true,
        ...saved.meta,
      };
    } catch {
      return { exists: false };
    }
  }

  /**
   * Transactionally restores local backup into active repositories after validating integrity checksum
   */
  public async restoreFromLocalBackup(): Promise<ImportResult> {
    try {
      const saved = await this.storage.getItem<StoredBackupPayload>(BackupService.KEY_BACKUP_VAULT, null as any);
      if (!saved || !saved.jsonDump) {
        return {
          success: false,
          importedCounts: { history: 0, favorites: 0, generator: 0, settingsUpdated: false },
          error: 'No valid local backup snapshot found in system storage.',
        };
      }

      const verifiedHash = this.computeSimpleHash(saved.jsonDump);
      if (saved.meta.checksum && saved.meta.checksum !== verifiedHash) {
        return {
          success: false,
          importedCounts: { history: 0, favorites: 0, generator: 0, settingsUpdated: false },
          error: 'Backup corrupted: Checksum mismatch detected during integrity evaluation.',
        };
      }

      return await this.importService.importJsonData(saved.jsonDump);
    } catch (err: any) {
      console.error('[BackupService] Exception during backup restore:', err);
      return {
        success: false,
        importedCounts: { history: 0, favorites: 0, generator: 0, settingsUpdated: false },
        error: err?.message || 'Unexpected failure while restoring from backup.',
      };
    }
  }

  public async deleteLocalBackup(): Promise<boolean> {
    try {
      await this.storage.removeItem(BackupService.KEY_BACKUP_VAULT);
      return true;
    } catch {
      return false;
    }
  }

  private computeSimpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }
}
