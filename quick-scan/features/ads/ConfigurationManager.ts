/**
 * QuickScan Enterprise Studio - AdMob Configuration Manager
 * Phase 20: Enforces Google Play policy screen exclusions, resolves Ad Unit IDs, and manages runtime test modes
 */
import { ADS_CONFIG, MonetizationConfig, AdUnitConfig, getPlatformOS } from '../../config/ads';
import { AdType, MeaningfulActionType } from './types';

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private currentConfig: MonetizationConfig;
  private runtimeTestMode: boolean;

  private constructor() {
    this.currentConfig = { ...ADS_CONFIG };
    this.runtimeTestMode = ADS_CONFIG.isTestMode;
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  public getAdUnitId(type: AdType): string {
    const os = getPlatformOS();
    const activeGroup: AdUnitConfig = this.runtimeTestMode
      ? this.currentConfig.testUnitIds[os]
      : this.currentConfig.productionUnitIds[os];
    
    return type === 'BANNER' ? activeGroup.banner : activeGroup.interstitial;
  }

  public isTestMode(): boolean {
    return this.runtimeTestMode;
  }

  public setTestMode(enabled: boolean): void {
    this.runtimeTestMode = enabled;
    console.log(`[ConfigurationManager] AdMob test mode toggled to: ${enabled}`);
  }

  /**
   * Strictly audits navigation screen identifiers against Google Play AdMob spam and placement policies
   * @returns true ONLY if screen is explicitly whitelisted for banner ads and NOT in forbidden list
   */
  public isScreenAuthorizedForBanner(screenName?: string): { authorized: boolean; reason: string } {
    if (!screenName) {
      return { authorized: false, reason: 'Screen identifier is empty or undefined.' };
    }
    const normalized = screenName.toLowerCase().trim();

    // 1. Check strict exclusion policies (Camera, Live Scanner, Splash, Onboarding, Permission Dialogs)
    const hitForbidden = this.currentConfig.policy.forbiddenScreens.find((f) =>
      normalized.includes(f.toLowerCase())
    );
    if (hitForbidden) {
      console.warn(`[AdPolicyViolationGuard] Blocked banner ad attempt on forbidden screen: "${screenName}" (Matched restriction: "${hitForbidden}")`);
      return {
        authorized: false,
        reason: `Screen "${screenName}" is strictly excluded from advertisements by Google Play Policy & UX rules.`,
      };
    }

    // 2. Verify explicit inclusion on utility screens (Home, History, Favorites, Settings, Generator)
    const isAllowed = this.currentConfig.policy.allowedBannerScreens.some((a) =>
      normalized.includes(a.toLowerCase()) || normalized === a.toLowerCase()
    );

    if (isAllowed) {
      return { authorized: true, reason: 'Screen is approved for unobtrusive banner advertisement placement.' };
    }

    return {
      authorized: false,
      reason: `Screen "${screenName}" is unassigned in explicit whitelist; defaulting to blocked for safety.`,
    };
  }

  /**
   * Validates whether a triggered event qualifies as a completed meaningful action suitable for Interstitial display
   */
  public isActionEligibleForInterstitial(action: MeaningfulActionType | string): boolean {
    const validActions: Array<MeaningfulActionType | string> = [
      'QR_GENERATED',
      'QR_EXPORTED',
      'BATCH_RESULTS_VIEWED',
      'FAVORITES_EXPORTED',
      'CUSTOM_STUDIO_TEMPLATE',
      'HISTORY_CLEARED'
    ];
    return validActions.includes(action);
  }

  public getFrequencyConfig() {
    return this.currentConfig.frequency;
  }

  public getPolicyConfig() {
    return this.currentConfig.policy;
  }
}
