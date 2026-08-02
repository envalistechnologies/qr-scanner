/**
 * QuickScan Studio - Scanner Provider
 * Phase 11 Architectural State Management (Injecting ScannerService & PermissionService)
 */
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { ScanResult, PermissionStatus } from '../types/domain';
import { ScannerService } from '../services/ScannerService';
import { PermissionService } from '../services/PermissionService';
import { useHistoryContext } from './HistoryProvider';

interface ScannerContextValue {
  isScanning: boolean;
  isTorchActive: boolean;
  cameraPermission: PermissionStatus;
  lastScan: ScanResult | null;
  startScanning: () => void;
  stopScanning: () => void;
  toggleTorch: () => Promise<void>;
  requestPermissions: () => Promise<PermissionStatus>;
  executeManualScan: (imageUri?: string) => Promise<ScanResult | null>;
  recordScanResult: (result: ScanResult) => void;
}

const ScannerContext = createContext<ScannerContextValue | undefined>(undefined);

export const ScannerProvider = ({ children }: { children: ReactNode }) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isTorchActive, setIsTorchActive] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<PermissionStatus>('not_determined');
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);

  const scannerService = useMemo(() => ScannerService.getInstance(), []);
  const permService = useMemo(() => PermissionService.getInstance(), []);
  const { addScanRecord } = useHistoryContext();

  useEffect(() => {
    const initPerms = async () => {
      const status = await permService.checkCameraPermission();
      setCameraPermission(status);
    };
    initPerms();
  }, [permService]);

  const startScanning = () => setIsScanning(true);
  const stopScanning = () => setIsScanning(false);

  const toggleTorch = async (): Promise<void> => {
    const nextState = !isTorchActive;
    await scannerService.toggleTorch(nextState);
    setIsTorchActive(nextState);
  };

  const requestPermissions = async (): Promise<PermissionStatus> => {
    const status = await permService.requestCameraPermission();
    setCameraPermission(status);
    return status;
  };

  const executeManualScan = async (imageUri?: string): Promise<ScanResult | null> => {
    const res = imageUri ? await scannerService.scanFromGallery(imageUri) : await scannerService.scanFromCamera();
    if (res) {
      setLastScan(res);
      addScanRecord(res).catch((e) => console.error('Failed to save manual scan to history:', e));
    }
    return res;
  };

  const recordScanResult = (result: ScanResult) => {
    setLastScan(result);
    addScanRecord(result).catch((e) => console.error('Failed to save recorded scan to history:', e));
  };

  const value = useMemo(
    () => ({
      isScanning,
      isTorchActive,
      cameraPermission,
      lastScan,
      startScanning,
      stopScanning,
      toggleTorch,
      requestPermissions,
      executeManualScan,
      recordScanResult,
    }),
    [isScanning, isTorchActive, cameraPermission, lastScan]
  );

  return <ScannerContext.Provider value={value}>{children}</ScannerContext.Provider>;
};

export function useScannerContext(): ScannerContextValue {
  const context = useContext(ScannerContext);
  if (!context) {
    throw new Error('useScannerContext must be used within a ScannerProvider');
  }
  return context;
}
