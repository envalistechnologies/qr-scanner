/**
 * QuickScan Studio - Platform Handlers Architecture
 * Phase 18: Dependency-Injected OS native capability bridges with complete error resilience and zero-crash boundaries
 */

export interface IPlatformBridge {
  copyToClipboard(text: string): Promise<boolean>;
  shareContent(text: string, title?: string): Promise<boolean>;
  openURL(url: string, mockInstalled?: boolean): Promise<{ success: boolean; error?: string }>;
  triggerSuccessHaptic(): Promise<void>;
  triggerErrorHaptic(): Promise<void>;
}

export class DefaultMockBridge implements IPlatformBridge {
  public async copyToClipboard(text: string): Promise<boolean> {
    console.log(`[PlatformBridge:Mock] Copied "${text}" to memory buffer.`);
    return true;
  }

  public async shareContent(text: string, title?: string): Promise<boolean> {
    console.log(`[PlatformBridge:Mock] Shared "${title || 'Item'}" with content: ${text}`);
    return true;
  }

  public async openURL(url: string, mockInstalled: boolean = true): Promise<{ success: boolean; error?: string }> {
    if (mockInstalled === false) {
      return { success: false, error: 'UNSUPPORTED_APP' };
    }
    if (!url || (!url.includes(':') && !url.startsWith('www.'))) {
      return { success: false, error: 'INVALID_URL' };
    }
    console.log(`[PlatformBridge:Mock] Launched Intent URI: ${url}`);
    return { success: true };
  }

  public async triggerSuccessHaptic(): Promise<void> {
    // Silently simulate success vibration pulse
  }

  public async triggerErrorHaptic(): Promise<void> {
    // Silently simulate error haptic feedback pulse
  }
}

export class PlatformHandlers {
  private static bridge: IPlatformBridge = new DefaultMockBridge();

  public static setBridge(customBridge: IPlatformBridge): void {
    this.bridge = customBridge;
  }

  public static async copyToClipboard(text: string): Promise<boolean> {
    try {
      const result = await this.bridge.copyToClipboard(text);
      await this.triggerSuccessHaptic();
      return result;
    } catch (e) {
      console.error('[PlatformHandlers] Clipboard copy failed:', e);
      return false;
    }
  }

  public static async shareContent(text: string, title?: string): Promise<boolean> {
    try {
      const result = await this.bridge.shareContent(text, title);
      await this.triggerSuccessHaptic();
      return result;
    } catch (e) {
      console.error('[PlatformHandlers] Share dialogue failed or cancelled:', e);
      return false;
    }
  }

  public static async openURL(url: string, mockInstalled: boolean = true): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await this.bridge.openURL(url, mockInstalled);
      if (res.success) {
        await this.triggerSuccessHaptic();
      }
      return res;
    } catch (err) {
      console.warn('[PlatformHandlers] Open URL exception:', err);
      return { success: false, error: 'UNSUPPORTED_APP' };
    }
  }

  public static async triggerSuccessHaptic(): Promise<void> {
    try {
      await this.bridge.triggerSuccessHaptic();
    } catch {
      // Ignore haptic errors
    }
  }

  public static async triggerErrorHaptic(): Promise<void> {
    try {
      await this.bridge.triggerErrorHaptic();
    } catch {
      // Ignore haptic errors
    }
  }
}
