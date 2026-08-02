/**
 * QuickScan Studio - Versioned Storage Migration Engine
 * Phase 17: Safe Schema Upgrades and Future Extensibility
 */
import { StorageService } from '../StorageService';
import { StoredScanItem } from '../types';

export interface MigrationResult {
  success: boolean;
  initialVersion: number;
  finalVersion: number;
  migrationsApplied: number[];
  error?: string;
}

type MigrationHandler = (storage: StorageService) => Promise<boolean>;

export class MigrationEngine {
  private static readonly VERSION_KEY = 'quickscan_storage_schema_version';
  private static readonly CURRENT_SCHEMA_VERSION = 2;
  private storage: StorageService;
  private migrations: Map<number, MigrationHandler> = new Map();

  constructor(storageInstance?: StorageService) {
    this.storage = storageInstance || StorageService.getInstance();
    this.registerMigrations();
  }

  private registerMigrations(): void {
    // Migration v0 -> v1: Initial Schema structure establishment & default vaults
    this.migrations.set(1, async (storage: StorageService) => {
      try {
        const history = await storage.getItem<any[]>('scan_history_vault', []);
        if (!Array.isArray(history)) {
          await storage.setItem('scan_history_vault', []);
        }
        const favorites = await storage.getItem<any[]>('favorites_vault', []);
        if (!Array.isArray(favorites)) {
          await storage.setItem('favorites_vault', []);
        }
        return true;
      } catch {
        return false;
      }
    });

    // Migration v1 -> v2: Upgrade historical scan records with mandatory Phase 17 metadata (source, contentType)
    this.migrations.set(2, async (storage: StorageService) => {
      try {
        const history = await storage.getItem<StoredScanItem[]>('scan_history_vault', []);
        let wasModified = false;
        if (history && history.length > 0) {
          const upgradedHistory = history.map((item) => {
            if (!item.source || !item.contentType) {
              wasModified = true;
              return {
                ...item,
                source: item.source || 'CAMERA',
                contentType: item.contentType || (item.symbology || 'PLAIN_TEXT'),
              };
            }
            return item;
          });
          if (wasModified) {
            await storage.setItem('scan_history_vault', upgradedHistory);
          }
        }
        return true;
      } catch {
        return false;
      }
    });
  }

  public async runMigrations(): Promise<MigrationResult> {
    let currentVersion = (await this.storage.getItem<number>(MigrationEngine.VERSION_KEY)) ?? 0;
    const initialVersion = currentVersion;
    const applied: number[] = [];

    try {
      while (currentVersion < MigrationEngine.CURRENT_SCHEMA_VERSION) {
        const nextVersion = currentVersion + 1;
        const migrationFunc = this.migrations.get(nextVersion);

        if (migrationFunc) {
          const stepSuccess = await migrationFunc(this.storage);
          if (!stepSuccess) {
            console.error(`[MigrationEngine] Migration failed at stage v${currentVersion} -> v${nextVersion}`);
            return {
              success: false,
              initialVersion,
              finalVersion: currentVersion,
              migrationsApplied: applied,
              error: `Migration stage v${nextVersion} failed during transformation.`,
            };
          }
        }

        currentVersion = nextVersion;
        await this.storage.setItem(MigrationEngine.VERSION_KEY, currentVersion);
        applied.push(currentVersion);
      }

      return {
        success: true,
        initialVersion,
        finalVersion: currentVersion,
        migrationsApplied: applied,
      };
    } catch (err: any) {
      console.error('[MigrationEngine] Unexpected exception during schema migration:', err);
      return {
        success: false,
        initialVersion,
        finalVersion: currentVersion,
        migrationsApplied: applied,
        error: err?.message || 'Unknown migration exception',
      };
    }
  }

  public async getCurrentVersion(): Promise<number> {
    return (await this.storage.getItem<number>(MigrationEngine.VERSION_KEY)) ?? 0;
  }

  public async forceVersionForTesting(version: number): Promise<void> {
    await this.storage.setItem(MigrationEngine.VERSION_KEY, version);
  }
}
