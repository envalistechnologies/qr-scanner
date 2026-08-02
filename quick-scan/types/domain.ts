/**
 * QuickScan Studio - Domain Type Interfaces
 * Phase 11 & Phase 13 Architectural Definition
 */

export type QRCodeType =
  | 'URL'
  | 'WIFI'
  | 'VCARD'
  | 'EMAIL'
  | 'SMS'
  | 'PHONE'
  | 'TEXT'
  | 'CALENDAR'
  | 'GEO'
  | 'WHATSAPP'
  | 'SOCIAL';

export type BarcodeType =
  | 'UPC_A'
  | 'UPC_E'
  | 'EAN_8'
  | 'EAN_13'
  | 'CODE_39'
  | 'CODE_93'
  | 'CODE_128'
  | 'ITF'
  | 'CODABAR'
  | 'PDF_417'
  | 'DATA_MATRIX'
  | 'AZTEC';

export type SymbologyType = QRCodeType | BarcodeType | 'QR' | 'BARCODE' | 'UNKNOWN';

export interface ScanResult {
  id: string;
  rawValue: string;
  displayTitle: string;
  symbology: SymbologyType;
  isQR: boolean;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface HistoryItem extends ScanResult {
  isFavorite: boolean;
  notes?: string;
  tagColor?: string;
}

export interface FavoriteItem {
  id: string;
  scanResultId: string;
  itemData: ScanResult;
  customLabel?: string;
  addedTimestamp: number;
}

export interface AppSettings {
  // Theme & Appearance
  themeMode: 'system' | 'light' | 'dark';
  language: string;
  animationPreference: boolean;

  // Scan Engine Preferences
  autoFlash: boolean;
  autoScan: boolean;
  duplicateScanDelayMs: number;
  hapticFeedback: boolean;
  audioFeedback: boolean;
  vibration: boolean;
  defaultScanMode: 'AUTO' | 'QR' | 'BARCODE' | 'BATCH';
  cameraFacing: 'back' | 'front';
  sound: boolean;

  // Generator Studio Preferences
  defaultQrType: QRCodeType;
  defaultQrSize: number;
  defaultQrMargin: number;
  defaultQrForeground: string;
  defaultQrBackground: string;
  defaultQrErrorCorrection: 'L' | 'M' | 'Q' | 'H';

  // Privacy & Storage Preferences
  saveHistoryToVault: boolean;
  analyticsToggle: boolean;
  crashReportingToggle: boolean;
}

export type PermissionStatus = 'granted' | 'denied' | 'restricted' | 'not_determined';

export interface GeneratorData {
  type: QRCodeType;
  payload: string;
  title: string;
  colorForeground: string;
  colorBackground: string;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  customLogoUri?: string;
}
