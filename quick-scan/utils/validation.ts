/**
 * QuickScan Studio - Validation Utilities
 * Phase 11 Architectural Layer
 */

export function isValidUrl(str: string): boolean {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isEmptyPayload(data?: string | null): boolean {
  return !data || data.trim().length === 0;
}

export function isValidHexColor(hex: string): boolean {
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex);
}
