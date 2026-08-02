import { QRCodeType, BarcodeType } from '../types/domain';

export const SUPPORTED_QR_TYPES: Record<QRCodeType, string> = {
  URL: 'Website URL Link',
  WIFI: 'Wi-Fi Access Network',
  VCARD: 'Personal Contact Card (vCard)',
  EMAIL: 'Email Message & Recipient',
  SMS: 'SMS Messaging Payload',
  PHONE: 'Telephone Call Action',
  TEXT: 'Plain UTF-8 Text Memo',
  CALENDAR: 'Calendar Event Scheduling',
  GEO: 'Geographic Map Coordinates',
  WHATSAPP: 'WhatsApp Direct Chat',
  SOCIAL: 'Social Media Profile Link',
};

export const SUPPORTED_BARCODE_TYPES: Record<BarcodeType, string> = {
  UPC_A: 'Universal Product Code (UPC-A)',
  UPC_E: 'Universal Product Code Zero-Compressed (UPC-E)',
  EAN_8: 'European Article Number 8-Digit',
  EAN_13: 'European Article Number 13-Digit',
  CODE_39: 'Alpha-Numeric Symbol (Code 39)',
  CODE_93: 'High Density Symbol (Code 93)',
  CODE_128: 'High-Density Barcode (Code 128)',
  ITF: 'Interleaved 2 of 5 Symbol (ITF)',
  CODABAR: 'Codabar Linear Symbology',
  PDF_417: 'Stacked 2D Barcode (PDF417)',
  DATA_MATRIX: 'Data Matrix Optical Symbol',
  AZTEC: 'Aztec 2D Optical Code',
};

export const APP_ROUTES = {
  HOME: '/(tabs)' as const,
  GENERATE: '/(tabs)/generate' as const,
  HISTORY: '/(tabs)/history' as const,
  SETTINGS: '/(tabs)/settings' as const,
  SCAN_RESULT: '/(screens)/scan-result' as const,
  FAVORITES: '/(screens)/favorites' as const,
  PRIVACY_POLICY: '/(screens)/privacy-policy' as const,
  FEEDBACK: '/(screens)/feedback' as const,
  ABOUT: '/(screens)/about' as const,
  APP_INFO: '/(screens)/app-information' as const,
  HELP: '/(screens)/help-support' as const,
};

export const ANIMATION_DURATIONS = {
  INSTANT: 0,
  FAST: 150,
  NORMAL: 250,
  SLOW: 350,
  MODAL_ENTER: 300,
  RIPPLE: 200,
} as const;

export const STORAGE_KEYS = {
  SETTINGS_PREFS: '@quickscan_settings_prefs',
  HISTORY_ARCHIVE: '@quickscan_history_archive',
  FAVORITES_VAULT: '@quickscan_favorites_vault',
  CUSTOM_QR_TEMPLATES: '@quickscan_custom_qr_templates',
  USER_CONSENT_ACK: '@quickscan_user_consent_acknowledged',
} as const;

export const THEME_KEYS = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
} as const;

export const SUPPORTED_LANGUAGES = {
  en: 'English (United States)',
  es: 'Español (España)',
  fr: 'Français (France)',
  de: 'Deutsch (Deutschland)',
  ja: '日本語 (Japan)',
} as const;
