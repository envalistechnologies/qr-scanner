/**
 * QuickScan Studio - Favorites Provider
 * Phase 11 Architectural State Management (Injecting FavoritesService)
 */
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { FavoriteItem, ScanResult } from '../types/domain';
import { FavoritesService } from '../services/FavoritesService';
import { StorageService } from '../storage/StorageService';

interface FavoritesContextValue {
  favorites: FavoriteItem[];
  isLoading: boolean;
  addFavorite: (scan: ScanResult, customLabel?: string) => Promise<FavoriteItem>;
  removeFavorite: (id: string) => Promise<void>;
  toggleFavorite: (scan: ScanResult, customLabel?: string) => Promise<void>;
  isFavoriteScan: (scanId: string) => boolean;
  clearFavorites: () => Promise<void>;
  updateFavoriteTitle: (id: string, newTitle: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const favService = useMemo(() => FavoritesService.getInstance(), []);

  useEffect(() => {
    const initFavs = async (silent = false) => {
      if (!silent) setIsLoading(true);
      const data = await favService.getFavorites();
      setFavorites(data);
      if (!silent) setIsLoading(false);
    };
    initFavs();
    const unsubscribe = StorageService.getInstance().addVaultListener(() => {
      initFavs(true);
    });
    return () => unsubscribe();
  }, [favService]);

  const isFavoriteScan = (scanId: string): boolean => {
    return favorites.some((f) => f.scanResultId === scanId || f.id === scanId);
  };

  const addFavorite = async (scan: ScanResult, customLabel?: string): Promise<FavoriteItem> => {
    if (isFavoriteScan(scan.id)) {
      return favorites.find((f) => f.scanResultId === scan.id || f.id === scan.id)!;
    }
    const newItem = await favService.toggleFavorite(scan, customLabel);
    setFavorites((prev) => [newItem, ...prev.filter((f) => f.scanResultId !== scan.id && f.id !== scan.id)]);
    return newItem;
  };

  const removeFavorite = async (id: string): Promise<void> => {
    await favService.removeFavorite(id);
    setFavorites((prev) => prev.filter((fav) => fav.id !== id && fav.scanResultId !== id));
  };

  const updateFavoriteTitle = async (id: string, newTitle: string): Promise<void> => {
    await favService.updateFavoriteTitle(id, newTitle);
    setFavorites((prev) =>
      prev.map((fav) => (fav.id === id || fav.scanResultId === id ? { ...fav, customLabel: newTitle } : fav))
    );
  };

  const toggleFavorite = async (scan: ScanResult, customLabel?: string): Promise<void> => {
    if (isFavoriteScan(scan.id)) {
      await removeFavorite(scan.id);
    } else {
      await addFavorite(scan, customLabel);
    }
  };

  const clearFavorites = async (): Promise<void> => {
    await favService.clearFavoritesVault();
    setFavorites([]);
  };

  const value = useMemo(
    () => ({
      favorites,
      isLoading,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavoriteScan,
      clearFavorites,
      updateFavoriteTitle,
    }),
    [favorites, isLoading]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export function useFavoritesContext(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
}
