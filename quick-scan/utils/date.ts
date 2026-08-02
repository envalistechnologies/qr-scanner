/**
 * QuickScan Studio - Date & Time Utility Stubs
 * Phase 11 Architectural Layer (No external date dependencies)
 */

export function formatTimestamp(epochMs: number): string {
  if (!epochMs) return 'Unknown Date';
  const date = new Date(epochMs);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(epochMs: number): string {
  const diffSeconds = Math.floor((Date.now() - epochMs) / 1000);
  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}
