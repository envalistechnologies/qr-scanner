/**
 * QuickScan Studio - Generator Service
 * Phase 16 Architectural Layer (Offline matrix encoding and asset export orchestration)
 */
import { GeneratorData } from '../types/domain';
import { GeneratorPayloadEncoders } from '../features/generator/GeneratorPayloadEncoders';
import { ExportService, ExportResult } from '../features/generator/ExportService';
import { GeneratorRepository } from '../storage/repositories/GeneratorRepository';
import { StoredGeneratorItem } from '../storage/types';

export class GeneratorService {
  private static instance: GeneratorService;
  private repo: GeneratorRepository;

  private constructor() {
    this.repo = GeneratorRepository.getInstance();
  }

  public static getInstance(): GeneratorService {
    if (!GeneratorService.instance) {
      GeneratorService.instance = new GeneratorService();
    }
    return GeneratorService.instance;
  }

  /**
   * Translates domain generator data into canonical RFC QR payload strings.
   */
  public async generateMatrix(data: GeneratorData | any): Promise<string> {
    const type = (data.type || 'text').toLowerCase();
    const payload = GeneratorPayloadEncoders.encode(type, data.formValues || { payload: data.payload });
    return payload;
  }

  /**
   * Exports an active QR rendering reference to PNG or SVG files in local storage.
   */
  public async exportMatrixImage(svgRef: any, format: 'png' | 'svg' = 'png'): Promise<ExportResult> {
    const exportService = ExportService.getInstance();
    if (format === 'svg') {
      return await exportService.exportToSvgFile(svgRef);
    }
    return await exportService.exportToPngFile(svgRef);
  }

  public async saveGeneratedRecord(data: GeneratorData): Promise<StoredGeneratorItem> {
    return await this.repo.saveGeneratedCode(data);
  }

  public async getRecentGenerated(): Promise<StoredGeneratorItem[]> {
    return await this.repo.getRecentGenerated();
  }
}
