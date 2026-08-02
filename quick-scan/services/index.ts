export interface ServiceResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export * from './ScannerService';
export * from './GeneratorService';
export * from './HistoryService';
export * from './FavoritesService';
export * from './StorageService';
export * from './PermissionService';
export * from './ShareService';
export * from './ClipboardService';
