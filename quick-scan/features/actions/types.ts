/**
 * QuickScan Studio - Smart Actions Engine Types
 * Phase 18 Architectural Layer
 */
import { IconName, icons } from '../../theme/icons';
import { StoredScanItem } from '../../storage/types';

export type ActionId =
  | 'COPY_TEXT'
  | 'SHARE_CONTENT'
  | 'OPEN_WEBSITE'
  | 'CALL_PHONE'
  | 'SEND_SMS'
  | 'COMPOSE_EMAIL'
  | 'OPEN_MAPS'
  | 'OPEN_GOOGLE_MAPS'
  | 'OPEN_PLAY_STORE'
  | 'OPEN_APP_STORE'
  | 'OPEN_WHATSAPP'
  | 'OPEN_YOUTUBE'
  | 'OPEN_FACEBOOK'
  | 'OPEN_INSTAGRAM'
  | 'OPEN_LINKEDIN'
  | 'OPEN_UPI_PAYMENT'
  | 'CONNECT_WIFI'
  | 'CREATE_CONTACT'
  | 'CREATE_CALENDAR'
  | 'COPY_WIFI_PASSWORD'
  | 'COPY_UPI_ID'
  | 'COPY_COORDINATES'
  | 'OPEN_BARCODE_SEARCH'
  | 'GENERATE_QR_FROM_RESULT'
  | 'TOGGLE_FAVORITE'
  | 'DELETE_HISTORY_ITEM'
  | 'RENAME_HISTORY_ITEM'
  | 'CLEAR_HISTORY_ITEM';

export type ActionCategory = 'PRIMARY' | 'QUICK' | 'SECONDARY' | 'MANAGEMENT';

export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export interface ActionDefinition {
  id: ActionId;
  label: string;
  subtitle?: string;
  icon: keyof typeof icons | IconName | string;
  category: ActionCategory;
  isPrimary?: boolean;
  isDestructive?: boolean;
  requiresConfirmation?: boolean;
  confirmationPrompt?: ConfirmationConfig;
  accessibilityHint?: string;
}

export interface ActionExecutionContext {
  scanId?: string;
  rawValue: string;
  contentType: string;
  displayTitle: string;
  symbology: string;
  isQR: boolean;
  parsedFields?: Array<{ label: string; value: string }>;
  parsedMetadata?: Record<string, any>;
  isFavorite?: boolean;
  // UI callbacks
  onToast?: (message: string, variant?: 'success' | 'error' | 'warning' | 'info') => void;
  onConfirmRequest?: (config: ConfirmationConfig, onConfirm: () => void, onCancel?: () => void) => void;
  onNavigate?: (route: string, params?: Record<string, any>) => void;
  onRenameRequest?: (currentLabel: string, onSubmit: (newLabel: string) => void) => void;
  // Testing hooks
  mockAppInstalled?: boolean;
  mockNetworkOnline?: boolean;
  mockPermissionGranted?: boolean;
}

export interface ActionExecutionResult {
  success: boolean;
  actionId: ActionId;
  message: string;
  errorCode?: 'UNSUPPORTED_APP' | 'INVALID_URL' | 'NETWORK_OFFLINE' | 'PERMISSION_DENIED' | 'USER_CANCELLED' | 'UNKNOWN_ERROR';
  wasCancelled?: boolean;
}

export interface ResolvedActionGroups {
  primary: ActionDefinition[];
  quick: ActionDefinition[];
  secondary: ActionDefinition[];
}
