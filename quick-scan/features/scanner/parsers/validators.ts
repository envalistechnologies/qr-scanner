/**
 * QuickScan Studio - Reusable Type Guards & Validators
 * Phase 14 Architectural Layer
 * Provides robust validation functions and exception-free string sanitization to shield parsers against malformed data.
 */

/**
 * Safely sanitizes input payloads against null, undefined, or corrupt non-string memory buffers.
 */
export const sanitizeRawPayload = (raw?: any): string => {
  if (!raw || typeof raw !== 'string') {
    return '';
  }
  return raw.trim();
};

/**
 * Verifies if the target string conforms to universal HTTP/HTTPS Web URL structures.
 */
export const isValidUrl = (str: string): boolean => {
  if (!str || typeof str !== 'string') return false;
  const trimmed = str.trim();
  const urlRegex = /^(https?:\/\/|www\.)[^\s/$.?#].[^\s]*$/i;
  return urlRegex.test(trimmed);
};

/**
 * Validates electronic mailing addresses with or without MAILTO protocol prefix.
 */
export const isValidEmail = (str: string): boolean => {
  if (!str) return false;
  const clean = str.replace(/^mailto:/i, '').split('?')[0].trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(clean);
};

/**
 * Validates global telephonic dial strings and country codes.
 */
export const isValidPhoneNumber = (str: string): boolean => {
  if (!str) return false;
  const clean = str.replace(/^(tel:|telnet:|smsto:|sms:)/i, '').split('?')[0].trim();
  const phoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s/0-9]*$/;
  return clean.length >= 5 && phoneRegex.test(clean);
};

/**
 * Ensures geographic GPS latitude and longitude fall within validated terrestrial physical coordinates.
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Validates Unified Payment Interface (UPI) schema structures.
 */
export const isValidUpi = (str: string): boolean => {
  if (!str) return false;
  const lower = str.trim().toLowerCase();
  return lower.startsWith('upi://pay') && (lower.includes('pa=') || lower.includes('receiver='));
};

/**
 * Validates Bitcoin decentralized currency address prefixes and URI schemas.
 */
export const isValidBitcoin = (str: string): boolean => {
  if (!str) return false;
  const trimmed = str.trim();
  if (trimmed.toLowerCase().startsWith('bitcoin:')) return true;
  // Basic check for base58 legacy (1, 3) or Bech32 (bc1) wallet strings
  const btcWalletRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
  return btcWalletRegex.test(trimmed);
};

/**
 * Type guard identifying optical linear physical barcodes vs 2D QR matrices from native camera hardware.
 */
export const isLinearBarcodeType = (hardwareType?: string): boolean => {
  if (!hardwareType) return false;
  const normal = hardwareType.toLowerCase().trim();
  const barcodeCodes = [
    'ean13',
    'ean-13',
    'ean8',
    'ean-8',
    'upc_a',
    'upc-a',
    'upca',
    'upc_e',
    'upc-e',
    'upce',
    'code39',
    'code-39',
    'code93',
    'code-93',
    'code128',
    'code-128',
    'itf14',
    'itf',
    'codabar',
    'pdf417',
    'datamatrix',
    'aztec',
  ];
  return barcodeCodes.includes(normal);
};

/**
 * Helper to safely extract domain names from URLs without raising exceptions on invalid URL parsing.
 */
export const safeExtractDomain = (urlStr: string): string => {
  try {
    let clean = urlStr.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('www.')) {
      clean = `https://${clean}`;
    }
    const parsed = new URL(clean.startsWith('www.') ? `https://${clean}` : clean);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    // Fallback extraction if strict URL constructor fails
    return urlStr.replace(/^(https?:\/\/)?(www\.)?/i, '').split('/')[0].split('?')[0];
  }
};
