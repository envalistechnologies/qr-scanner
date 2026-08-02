/**
 * QuickScan Studio - useGenerator Custom Hook
 * Phase 11 Architectural Layer
 */
import { useGeneratorContext } from '../providers/GeneratorProvider';

export const useGenerator = () => {
  return useGeneratorContext();
};
export default useGenerator;
