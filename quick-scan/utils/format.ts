/**
 * QuickScan Studio - Payload Formatting Utilities
 * Phase 11 Architectural Layer
 */
import { SymbologyType } from '../types/domain';
import { SUPPORTED_QR_TYPES, SUPPORTED_BARCODE_TYPES } from '../constants/config';

export function truncatePayload(text: string, maxChars: number = 50): string {
  if (!text || text.length <= maxChars) return text || '';
  return `${text.substring(0, maxChars)}...`;
}

export function formatPayloadAsTitle(text: string, type: SymbologyType): string {
  if (!text) return 'Empty Scan Payload';
  const clean = text.trim().replace(/^https?:\/\//i, '');
  if (type in SUPPORTED_QR_TYPES) {
    return `${SUPPORTED_QR_TYPES[type as keyof typeof SUPPORTED_QR_TYPES]}: ${truncatePayload(clean, 25)}`;
  }
  if (type in SUPPORTED_BARCODE_TYPES) {
    return `${SUPPORTED_BARCODE_TYPES[type as keyof typeof SUPPORTED_BARCODE_TYPES]} (#${clean})`;
  }
  return truncatePayload(clean, 30);
}
