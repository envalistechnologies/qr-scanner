/**
 * QuickScan Studio - useScanner Custom Hook
 * Phase 11 Architectural Layer
 */
import { useScannerContext } from '../providers/ScannerProvider';

export const useScanner = () => {
  return useScannerContext();
};
export default useScanner;
