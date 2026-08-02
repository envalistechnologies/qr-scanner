/**
 * QuickScan Studio - Generator Repository Implementation
 * Phase 17: Persists QR Matrix Creations, Custom Color Swatches, and Saved Preset Templates
 */
import { IGeneratorRepository, StoredGeneratorItem, StoredGeneratorState } from '../types';
import { StorageService } from '../StorageService';
import { GeneratorData } from '../../types/domain';
import { generateUUID } from '../../utils/strings';

const DEFAULT_GENERATOR_STATE: StoredGeneratorState = {
  recentGenerated: [],
  recentColors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#000000'],
  recentCustomizations: [],
  templates: [],
};

export class GeneratorRepository implements IGeneratorRepository {
  private static instance: GeneratorRepository;
  private static readonly KEY_GENERATOR = 'generator_vault';
  private storage: StorageService;
  private inMemoryState: StoredGeneratorState | null = null;

  private constructor() {
    this.storage = StorageService.getInstance();
  }

  public static getInstance(): GeneratorRepository {
    if (!GeneratorRepository.instance) {
      GeneratorRepository.instance = new GeneratorRepository();
    }
    return GeneratorRepository.instance;
  }

  private async loadState(): Promise<StoredGeneratorState> {
    if (this.inMemoryState !== null) {
      return this.inMemoryState;
    }
    const data = await this.storage.getItem<StoredGeneratorState>(GeneratorRepository.KEY_GENERATOR, DEFAULT_GENERATOR_STATE);
    this.inMemoryState = { ...DEFAULT_GENERATOR_STATE, ...(data || {}) };
    return this.inMemoryState;
  }

  private async saveState(state: StoredGeneratorState): Promise<boolean> {
    this.inMemoryState = state;
    return await this.storage.setItem(GeneratorRepository.KEY_GENERATOR, state);
  }

  public async saveGeneratedCode(data: GeneratorData): Promise<StoredGeneratorItem> {
    const state = await this.loadState();
    const newItem: StoredGeneratorItem = {
      id: generateUUID(),
      timestamp: Date.now(),
      data,
      favorite: false,
    };
    // Cap recent generated list at 500 records
    const updatedGenerated = [newItem, ...state.recentGenerated].slice(0, 500);
    await this.saveState({ ...state, recentGenerated: updatedGenerated });
    return newItem;
  }

  public async getRecentGenerated(): Promise<StoredGeneratorItem[]> {
    const state = await this.loadState();
    return [...state.recentGenerated];
  }

  public async deleteGeneratedCode(id: string): Promise<boolean> {
    const state = await this.loadState();
    const filtered = state.recentGenerated.filter((i) => i.id !== id);
    if (filtered.length === state.recentGenerated.length) {
      return false;
    }
    await this.saveState({ ...state, recentGenerated: filtered });
    return true;
  }

  public async clearGeneratedHistory(): Promise<boolean> {
    const state = await this.loadState();
    await this.saveState({ ...state, recentGenerated: [] });
    return true;
  }

  public async saveRecentColor(hexColor: string): Promise<string[]> {
    const state = await this.loadState();
    const cleanHex = hexColor.toUpperCase();
    const filtered = state.recentColors.filter((c) => c !== cleanHex);
    const updatedColors = [cleanHex, ...filtered].slice(0, 20); // keep max 20 colors
    await this.saveState({ ...state, recentColors: updatedColors });
    return updatedColors;
  }

  public async getRecentColors(): Promise<string[]> {
    const state = await this.loadState();
    return [...state.recentColors];
  }

  public async saveTemplate(data: GeneratorData): Promise<StoredGeneratorItem> {
    const state = await this.loadState();
    const newTemplate: StoredGeneratorItem = {
      id: generateUUID(),
      timestamp: Date.now(),
      data,
      favorite: true,
    };
    const updatedTemplates = [newTemplate, ...state.templates];
    await this.saveState({ ...state, templates: updatedTemplates });
    return newTemplate;
  }

  public async getTemplates(): Promise<StoredGeneratorItem[]> {
    const state = await this.loadState();
    return [...state.templates];
  }

  public clearMemoryCache(): void {
    this.inMemoryState = null;
  }
}
