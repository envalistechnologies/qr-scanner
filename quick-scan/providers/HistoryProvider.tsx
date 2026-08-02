/**
 * QuickScan Studio - History Provider
 * Phase 11 Architectural State Management (Injecting HistoryService)
 */
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { HistoryItem, ScanResult } from '../types/domain';
import { HistoryService } from '../services/HistoryService';
import { StorageService } from '../storage/StorageService';

interface HistoryContextValue {
  items: HistoryItem[];
  isLoading: boolean;
  addScanRecord: (scan: ScanResult) => Promise<HistoryItem>;
  removeRecord: (id: string) => Promise<void>;
  clearArchive: () => Promise<void>;
  refreshHistory: (silent?: boolean) => Promise<void>;
  updateRecordTitle: (id: string, newTitle: string) => Promise<void>;
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

export const HistoryProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const historyService = useMemo(() => HistoryService.getInstance(), []);

  const refreshHistory = async (silent = false): Promise<void> => {
    if (!silent) setIsLoading(true);
    const loaded = await historyService.getHistory();
    setItems(loaded);
    if (!silent) setIsLoading(false);
  };

  useEffect(() => {
    refreshHistory();
    const unsubscribe = StorageService.getInstance().addVaultListener(() => {
      refreshHistory(true);
    });
    return () => unsubscribe();
  }, [historyService]);

  const addScanRecord = async (scan: ScanResult): Promise<HistoryItem> => {
    const newItem = await historyService.addRecord(scan);
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const removeRecord = async (id: string): Promise<void> => {
    await historyService.deleteRecord(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateRecordTitle = async (id: string, newTitle: string): Promise<void> => {
    await historyService.updateRecordTitle(id, newTitle);
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, displayTitle: newTitle } : item)));
  };

  const clearArchive = async (): Promise<void> => {
    await historyService.clearAllHistory();
    setItems([]);
  };

  const value = useMemo(
    () => ({
      items,
      isLoading,
      addScanRecord,
      removeRecord,
      clearArchive,
      refreshHistory,
      updateRecordTitle,
    }),
    [items, isLoading]
  );

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>;
};

export function useHistoryContext(): HistoryContextValue {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
}
