/**
 * QuickScan Studio - Permission Interpreting Helper Utilities
 * Phase 11 Architectural Layer
 */
import { PermissionStatus } from '../types/domain';

export function parseOSPermissionStatus(rawStatus: string | undefined): PermissionStatus {
  if (!rawStatus) return 'not_determined';
  switch (rawStatus.toLowerCase()) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    case 'restricted':
    case 'limited':
      return 'restricted';
    default:
      return 'not_determined';
  }
}

export function isPermissionOperational(status: PermissionStatus): boolean {
  return status === 'granted' || status === 'restricted';
}
