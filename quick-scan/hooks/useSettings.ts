/**
 * QuickScan Studio - useSettings Custom Hook
 * Phase 11 Architectural Layer
 */
import { useSettingsContext } from '../providers/SettingsProvider';

export const useSettings = () => {
  return useSettingsContext();
};
export default useSettings;
