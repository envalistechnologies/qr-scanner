/**
 * QuickScan Studio - String Manipulation Utilities
 * Phase 11 Architectural Layer
 */

export function capitalizeFirstLetter(string: string): string {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function sanitizeFileName(name: string): string {
  if (!name) return 'scan_export';
  return name.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
}

export function generateUUID(): string {
  // Pure JavaScript deterministic pseudo-random ID generator stub
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
