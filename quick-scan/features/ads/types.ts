/**
 * QuickScan Enterprise Studio - Master Google AdMob Type Definitions
 * Phase 20 Architectural Domain Schemas
 */

export type AdType = 'BANNER' | 'INTERSTITIAL';

export type AdStatus = 'IDLE' | 'LOADING' | 'READY' | 'SHOWING' | 'CLOSED' | 'ERROR';

export type AdErrorType =
  | 'NO_FILL'
  | 'LOAD_FAILURE'
  | 'NETWORK_ERROR'
  | 'AD_CLOSED'
  | 'AD_CLICKED'
  | 'AD_TIMEOUT'
  | 'POLICY_BLOCKED'
  | 'FREQUENCY_LIMITED'
  | 'OFFLINE'
  | 'EXPO_GO_FALLBACK';

export interface AdEvent {
  id: string;
  type: AdType;
  status: AdStatus;
  timestamp: number;
  screen?: string;
  errorType?: AdErrorType;
  details?: string;
}

export type ConsentStatus =
  | 'UNKNOWN'
  | 'NOT_REQUIRED_NON_EEA'
  | 'OBTAINED_PERSONALIZED'
  | 'OBTAINED_NON_PERSONALIZED'
  | 'DENIED_LIMITED';

export type MeaningfulActionType =
  | 'QR_GENERATED'
  | 'QR_EXPORTED'
  | 'BATCH_RESULTS_VIEWED'
  | 'FAVORITES_EXPORTED'
  | 'CUSTOM_STUDIO_TEMPLATE';

export interface AdLoadOptions {
  timeoutMs?: number;
  maxRetries?: number;
  ignoreCooldown?: boolean;
}

export interface AdImpressionResult {
  success: boolean;
  type: AdType;
  screen?: string;
  errorType?: AdErrorType;
  reason?: string;
  actionCountRemaining?: number;
}
