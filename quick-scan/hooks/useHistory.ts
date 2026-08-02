/**
 * QuickScan Studio - useHistory Custom Hook
 * Phase 11 Architectural Layer
 */
import { useHistoryContext } from '../providers/HistoryProvider';

export const useHistory = () => {
  return useHistoryContext();
};
export default useHistory;
