/**
 * QuickScan Studio - Native OS Platform Bridge Implementation
 * Phase 18: Real device implementation connecting Expo Haptics, Expo Linking, and OS clipboard/sharing engines
 */
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { ClipboardService } from '../../../services/ClipboardService';
import { ShareService } from '../../../services/ShareService';
import { IPlatformBridge } from '../PlatformHandlers';

export class NativePlatformBridge implements IPlatformBridge {
  public async copyToClipboard(text: string): Promise<boolean> {
    try {
      ClipboardService.getInstance().copyToClipboard(text);
      return true;
    } catch (e) {
      console.error('[NativePlatformBridge] Clipboard exception:', e);
      return false;
    }
  }

  public async shareContent(text: string, title?: string): Promise<boolean> {
    try {
      await ShareService.getInstance().shareText(text, title || 'Decoded QR Scan');
      return true;
    } catch (e) {
      console.error('[NativePlatformBridge] Share dialog exception:', e);
      return false;
    }
  }

  public async openURL(url: string, mockInstalled: boolean = true): Promise<{ success: boolean; error?: string }> {
    try {
      if (mockInstalled === false) {
        return { success: false, error: 'UNSUPPORTED_APP' };
      }

      if (!url || (!url.includes(':') && !url.startsWith('www.'))) {
        return { success: false, error: 'INVALID_URL' };
      }

      let finalUrl = url;
      if (url.startsWith('www.')) {
        finalUrl = `https://${url}`;
      }

      const supported = await Linking.canOpenURL(finalUrl).catch(() => false);
      if (!supported && !finalUrl.startsWith('http')) {
        return { success: false, error: 'UNSUPPORTED_APP' };
      }

      await Linking.openURL(finalUrl);
      return { success: true };
    } catch (err) {
      console.warn('[NativePlatformBridge] Open URL failed:', err);
      return { success: false, error: 'UNSUPPORTED_APP' };
    }
  }

  public async triggerSuccessHaptic(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore haptic errors on unsupported hardware
    }
  }

  public async triggerErrorHaptic(): Promise<void> {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignore haptic errors
    }
  }
}
