/**
 * QuickScan Studio - Offline Export Service Engine
 * Phase 19: Serializes local scan history, favorites, generator archives, and settings to JSON and RFC 4180 CSV
 */
import { HistoryRepository } from '../../storage/repositories/HistoryRepository';
import { FavoritesRepository } from '../../storage/repositories/FavoritesRepository';
import { GeneratorRepository } from '../../storage/repositories/GeneratorRepository';
import { PreferenceRepository } from '../../storage/repositories/PreferenceRepository';
import { PlatformHandlers } from '../actions/PlatformHandlers';

export interface ExportOptions {
  history?: boolean;
  favorites?: boolean;
  generator?: boolean;
  settings?: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: string;
  format: 'JSON' | 'CSV';
  recordCount: number;
  error?: string;
}

export class ExportService {
  private static instance: ExportService;
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

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Exports specified vault repositories to a structured JSON manifest string
   */
  public async exportToJson(options: ExportOptions = { history: true, favorites: true, generator: true, settings: true }): Promise<ExportResult> {
    try {
      const exportPayload: Record<string, any> = {
        meta: {
          generator: 'QuickScan Studio',
          schemaVersion: '3.4.0',
          timestamp: Date.now(),
          isoDate: new Date().toISOString(),
        },
      };

      let count = 0;
      if (options.history) {
        const history = await this.historyRepo.getAllRecords();
        exportPayload.history = history;
        count += history.length;
      }
      if (options.favorites) {
        const favorites = await this.favoritesRepo.getAllFavorites();
        exportPayload.favorites = favorites;
        count += favorites.length;
      }
      if (options.generator) {
        const generated = await this.generatorRepo.getRecentGenerated();
        const templates = await this.generatorRepo.getTemplates();
        exportPayload.generator = { recentGenerated: generated, templates };
        count += generated.length + templates.length;
      }
      if (options.settings) {
        const settings = await this.preferenceRepo.getSettings();
        exportPayload.settings = settings;
        count += 1;
      }

      return {
        success: true,
        data: JSON.stringify(exportPayload, null, 2),
        format: 'JSON',
        recordCount: count,
      };
    } catch (err: any) {
      console.error('[ExportService] Error exporting JSON payload:', err);
      return {
        success: false,
        format: 'JSON',
        recordCount: 0,
        error: err?.message || 'Unexpected failure generating JSON export vault.',
      };
    }
  }

  /**
   * Exports target dataset to an RFC 4180 compliant CSV table string
   */
  public async exportToCsv(target: 'history' | 'favorites' | 'generator'): Promise<ExportResult> {
    try {
      let rows: string[] = [];
      let count = 0;

      if (target === 'history') {
        const items = await this.historyRepo.getAllRecords();
        rows.push('"ID","Title","Symbology","ContentType","RawValue","Source","Timestamp","Date"');
        for (const it of items) {
          const id = this.escapeCsv(it.id);
          const title = this.escapeCsv((it as any).displayTitle || 'Untitled');
          const sym = this.escapeCsv((it as any).symbology || 'QR');
          const cType = this.escapeCsv((it as any).contentType || 'UNKNOWN');
          const val = this.escapeCsv((it as any).rawValue || '');
          const src = this.escapeCsv((it as any).source || 'CAMERA');
          const ts = it.timestamp || 0;
          const dt = new Date(ts).toISOString().split('T')[0];
          rows.push(`${id},${title},${sym},${cType},${val},${src},${ts},"${dt}"`);
        }
        count = items.length;
      } else if (target === 'favorites') {
        const items = await this.favoritesRepo.getAllFavorites();
        rows.push('"FavoriteID","ScanID","CustomLabel","RawValue","Symbology","AddedTimestamp"');
        for (const fav of items) {
          const fid = this.escapeCsv(fav.id);
          const sid = this.escapeCsv(fav.scanResultId || fav.id);
          const label = this.escapeCsv(fav.customLabel || fav.itemData?.displayTitle || 'Favorite');
          const val = this.escapeCsv(fav.itemData?.rawValue || '');
          const type = this.escapeCsv(fav.itemData?.symbology || 'QR');
          const ts = fav.addedTimestamp || 0;
          rows.push(`${fid},${sid},${label},${val},${type},${ts}`);
        }
        count = items.length;
      } else if (target === 'generator') {
        const items = await this.generatorRepo.getRecentGenerated();
        rows.push('"ID","Title","Type","Payload","Foreground","Background","ErrorCorrection","Timestamp"');
        for (const g of items) {
          const gid = this.escapeCsv(g.id);
          const title = this.escapeCsv(g.data.title || 'QR Code');
          const type = this.escapeCsv(g.data.type || 'URL');
          const payload = this.escapeCsv(g.data.payload || '');
          const fg = this.escapeCsv(g.data.colorForeground || '#000');
          const bg = this.escapeCsv(g.data.colorBackground || '#fff');
          const ec = this.escapeCsv(g.data.errorCorrection || 'M');
          const ts = g.timestamp || 0;
          rows.push(`${gid},${title},${type},${payload},${fg},${bg},${ec},${ts}`);
        }
        count = items.length;
      }

      return {
        success: true,
        data: rows.join('\n'),
        format: 'CSV',
        recordCount: count,
      };
    } catch (err: any) {
      console.error('[ExportService] Error exporting CSV table:', err);
      return {
        success: false,
        format: 'CSV',
        recordCount: 0,
        error: err?.message || 'Unexpected failure compiling CSV export.',
      };
    }
  }

  /**
   * Shares exported dataset using native OS sharing dialogue or clipboard fallback
   */
  public async shareExportedData(exportResult: ExportResult, title = 'QuickScan Export'): Promise<boolean> {
    if (!exportResult.success || !exportResult.data) {
      return false;
    }
    return await PlatformHandlers.shareContent(exportResult.data, title);
  }

  private escapeCsv(val: any): string {
    if (val == null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  }
}
