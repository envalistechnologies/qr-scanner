/**
 * QuickScan Studio - Generator Provider
 * Phase 11 Architectural State Management (Injecting GeneratorService)
 */
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { GeneratorData } from '../types/domain';
import { GeneratorService } from '../services/GeneratorService';
import { StoredGeneratorItem } from '../storage/types';

interface GeneratorContextValue {
  activeConfig: GeneratorData;
  generatedMatrixUri: string | null;
  history: StoredGeneratorItem[];
  updateConfig: <K extends keyof GeneratorData>(field: K, val: GeneratorData[K]) => void;
  generate: () => Promise<string>;
  resetConfig: () => void;
  saveCurrentToHistory: (customData?: GeneratorData) => Promise<StoredGeneratorItem>;
  refreshHistory: () => Promise<void>;
}

const DEFAULT_GENERATOR_DATA: GeneratorData = {
  type: 'URL',
  payload: 'https://envalis.technologies.studio',
  title: 'Envalis Technologies Website',
  colorForeground: '#3B82F6',
  colorBackground: '#1E1E2E',
  errorCorrection: 'Q',
};

const GeneratorContext = createContext<GeneratorContextValue | undefined>(undefined);

export const GeneratorProvider = ({ children }: { children: ReactNode }) => {
  const [activeConfig, setActiveConfig] = useState<GeneratorData>(DEFAULT_GENERATOR_DATA);
  const [generatedMatrixUri, setGeneratedMatrixUri] = useState<string | null>(null);
  const [history, setHistory] = useState<StoredGeneratorItem[]>([]);
  const generatorService = useMemo(() => GeneratorService.getInstance(), []);

  const refreshHistory = useCallback(async () => {
    const records = await generatorService.getRecentGenerated();
    setHistory(records);
  }, [generatorService]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const updateConfig = <K extends keyof GeneratorData>(field: K, val: GeneratorData[K]) => {
    setActiveConfig((prev) => ({ ...prev, [field]: val }));
  };

  const saveCurrentToHistory = async (customData?: GeneratorData): Promise<StoredGeneratorItem> => {
    const dataToSave = customData || activeConfig;
    const item = await generatorService.saveGeneratedRecord(dataToSave);
    setHistory((prev) => [item, ...prev.filter((i) => i.id !== item.id)]);
    return item;
  };

  const generate = async (): Promise<string> => {
    const uri = await generatorService.generateMatrix(activeConfig);
    setGeneratedMatrixUri(uri);
    await saveCurrentToHistory(activeConfig).catch((e) => console.error('Error saving generated QR:', e));
    return uri;
  };

  const resetConfig = () => {
    setActiveConfig(DEFAULT_GENERATOR_DATA);
    setGeneratedMatrixUri(null);
  };

  const value = useMemo(
    () => ({
      activeConfig,
      generatedMatrixUri,
      history,
      updateConfig,
      generate,
      resetConfig,
      saveCurrentToHistory,
      refreshHistory,
    }),
    [activeConfig, generatedMatrixUri, history, saveCurrentToHistory, refreshHistory]
  );

  return <GeneratorContext.Provider value={value}>{children}</GeneratorContext.Provider>;
};

export function useGeneratorContext(): GeneratorContextValue {
  const context = useContext(GeneratorContext);
  if (!context) {
    throw new Error('useGeneratorContext must be used within a GeneratorProvider');
  }
  return context;
}
