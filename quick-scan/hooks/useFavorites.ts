/**
 * QuickScan Studio - useFavorites Custom Hook
 * Phase 11 Architectural Layer
 */
import { useFavoritesContext } from '../providers/FavoritesProvider';

export const useFavorites = () => {
  return useFavoritesContext();
};
export default useFavorites;
