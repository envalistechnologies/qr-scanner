/**
 * QuickScan Enterprise Studio - AdMob Interstitial Manager Sub-Engine
 * Phase 20: Manages background preloading, meaningful action trigger validation, frequency enforcement, and UI modal broadcast
 */
import { ConfigurationManager } from './ConfigurationManager';
import { FrequencyManager } from './FrequencyManager';
import { ConsentManager } from './ConsentManager';
import { AdErrorType, AdImpressionResult } from './types';

export type InterstitialListener = (visible: boolean, unitId: string, triggerReason?: string) => void;

export class InterstitialManager {
  private static instance: InterstitialManager;
  private configManager: ConfigurationManager;
  private frequencyManager: FrequencyManager;
  private consentManager: ConsentManager;

  private isPreloaded: boolean = false;
  private preloadedUnitId: string | null = null;
  private isCurrentlyShowing: boolean = false;
  private simulatedNetworkOffline: boolean = false;
  private preloadPromise: Promise<boolean> | null = null;
  private listeners: InterstitialListener[] = [];

  private constructor() {
    this.configManager = ConfigurationManager.getInstance();
    this.frequencyManager = FrequencyManager.getInstance();
    this.consentManager = ConsentManager.getInstance();
  }

  public static getInstance(): InterstitialManager {
    if (!InterstitialManager.instance) {
      InterstitialManager.instance = new InterstitialManager();
    }
    return InterstitialManager.instance;
  }

  /**
   * Subscribes a UI modal presentation component to real-time interstitial impression requests
   */
  public subscribe(listener: InterstitialListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(visible: boolean, unitId: string, reason?: string): void {
    this.listeners.forEach((listener) => {
      try {
        listener(visible, unitId, reason);
      } catch (err) {
        console.error('[InterstitialManager] Listener notification error:', err);
      }
    });
  }

  /**
   * Preloads an interstitial advertisement in background memory to guarantee zero latency upon presentation
   */
  public async preloadInterstitial(force = false): Promise<{ success: boolean; unitId?: string; errorType?: AdErrorType }> {
    if (this.simulatedNetworkOffline) {
      this.isPreloaded = false;
      return { success: false, errorType: 'OFFLINE' };
    }
    if (this.isPreloaded && !force && this.preloadedUnitId) {
      return { success: true, unitId: this.preloadedUnitId };
    }
    if (this.preloadPromise && !force) {
      const ok = await this.preloadPromise;
      return { success: ok, unitId: this.preloadedUnitId || undefined };
    }

    this.preloadPromise = (async () => {
      try {
        if (this.simulatedNetworkOffline) {
          console.warn('[InterstitialManager] Preload aborted: Network connectivity offline.');
          this.isPreloaded = false;
          return false;
        }
        const canRequest = await this.consentManager.canRequestAds();
        if (!canRequest) {
          this.isPreloaded = false;
          return false;
        }

        const unitId = this.configManager.getAdUnitId('INTERSTITIAL');
        // Simulate quick background network fill resolve
        await new Promise((res) => setTimeout(res, 50));
        this.preloadedUnitId = unitId;
        this.isPreloaded = true;
        console.log(`[InterstitialManager] Successfully preloaded interstitial asset in memory buffer (Unit ID: ${unitId}).`);
        return true;
      } catch (err) {
        console.error('[InterstitialManager] Exception during interstitial background preloading:', err);
        this.isPreloaded = false;
        return false;
      } finally {
        this.preloadPromise = null;
      }
    })();

    const success = await this.preloadPromise;
    return success
      ? { success: true, unitId: this.preloadedUnitId! }
      : { success: false, errorType: this.simulatedNetworkOffline ? 'NETWORK_ERROR' : 'NO_FILL' };
  }

  /**
   * Triggers interstitial display ONLY if current view is permissible, triggering UI modal presentation
   */
  public async showInterstitialIfEligible(options: { ignoreCooldown?: boolean; currentScreen?: string; triggerReason?: string } = {}): Promise<AdImpressionResult> {
    const { ignoreCooldown = false, currentScreen = 'general', triggerReason = 'Sponsored Enterprise Offer' } = options;

    // 1. Strict Policy Exclusion Check: Never interrupt active camera preview, live scanning, or permission dialogues
    if (currentScreen) {
      const normalized = currentScreen.toLowerCase().trim();
      const isForbidden = ['scanner', 'camera', 'permission', 'splash', 'onboarding'].some((s) => normalized === s || (normalized.includes(s) && !normalized.includes('result')));
      if (isForbidden) {
        console.warn(`[AdPolicyViolationGuard] Blocked interstitial attempt on active operational screen: "${currentScreen}"`);
        return {
          success: false,
          type: 'INTERSTITIAL',
          screen: currentScreen,
          errorType: 'POLICY_BLOCKED',
          reason: `Interstitials are strictly forbidden from interrupting live scanning or onboarding workflows ("${currentScreen}").`,
        };
      }
    }

    if (this.isCurrentlyShowing) {
      return { success: false, type: 'INTERSTITIAL', screen: currentScreen, errorType: 'LOAD_FAILURE', reason: 'Ad already displaying.' };
    }

    // 2. Frequency & Action Cap Audit (Bypassed if ignoreCooldown is true for user-defined exact thresholds)
    if (!ignoreCooldown) {
      const eligibility = this.frequencyManager.evaluateInterstitialEligibility(false);
      if (!eligibility.permitted) {
        return {
          success: false,
          type: 'INTERSTITIAL',
          screen: currentScreen,
          errorType: 'FREQUENCY_LIMITED',
          reason: `Ad frequency suppression active (${eligibility.reason}).`,
          actionCountRemaining: eligibility.actionsRemaining || 0,
        };
      }
    }

    // 3. Asset Availability Audit
    if (!this.isPreloaded || this.simulatedNetworkOffline || !this.preloadedUnitId) {
      const quickLoad = await this.preloadInterstitial(true);
      if (!quickLoad.success) {
        console.warn('[InterstitialManager] Interstitial impression aborted: Ad asset unavailable or network offline. Flow unaffected.');
        return {
          success: false,
          type: 'INTERSTITIAL',
          screen: currentScreen,
          errorType: 'NO_FILL',
          reason: 'No preloaded ad asset available to display.',
        };
      }
    }

    // 4. Trigger UI Modal Broadcast
    this.isCurrentlyShowing = true;
    const activeUnit = this.preloadedUnitId || this.configManager.getAdUnitId('INTERSTITIAL');
    console.log(`[InterstitialManager] Presenting Full-Screen Interstitial Ad modal to user (Trigger: ${triggerReason}).`);
    this.notifyListeners(true, activeUnit, triggerReason);

    this.frequencyManager.recordInterstitialShown();
    this.isPreloaded = false; // Consumer used the asset

    return {
      success: true,
      type: 'INTERSTITIAL',
      screen: currentScreen,
      reason: 'Interstitial impression executed successfully.',
      actionCountRemaining: 0,
    };
  }

  /**
   * Called when the user closes or dismisses the interstitial advertisement modal
   */
  public dismissInterstitial(): void {
    if (this.isCurrentlyShowing) {
      this.isCurrentlyShowing = false;
      console.log('[InterstitialManager] Interstitial Ad modal dismissed by user.');
      this.notifyListeners(false, '', '');
      // Automatically initiate background preload for subsequent actions
      this.preloadInterstitial().catch(() => {});
    }
  }

  public isReady(): boolean {
    return this.isPreloaded && !this.simulatedNetworkOffline;
  }

  public simulateNetworkOffline(offline: boolean): void {
    this.simulatedNetworkOffline = offline;
    if (offline) {
      this.isPreloaded = false;
      this.preloadedUnitId = null;
      this.preloadPromise = null;
    }
    console.log(`[InterstitialManager] Simulated network connection status toggled to: ${offline ? 'OFFLINE (Disconnected)' : 'ONLINE (Connected)'}`);
  }

  public releaseResources(): void {
    this.isPreloaded = false;
    this.preloadedUnitId = null;
    this.preloadPromise = null;
    this.isCurrentlyShowing = false;
    this.listeners = [];
    console.log('[InterstitialManager] All preloaded interstitial buffers and timers discharged cleanly.');
  }
}
