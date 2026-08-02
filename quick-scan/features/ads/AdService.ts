/**
 * QuickScan Enterprise Studio - Master Google AdMob Service Orchestrator
 * Phase 20: Unified monetization interface controlling policy validation, banner placement, interstitial triggers (tab switches, scan quotas, startup), and GDPR consent
 */
import { ConfigurationManager } from './ConfigurationManager';
import { ConsentManager } from './ConsentManager';
import { FrequencyManager } from './FrequencyManager';
import { BannerManager, BannerLoadResult } from './BannerManager';
import { InterstitialManager, InterstitialListener } from './InterstitialManager';
import { AdLoadOptions, AdImpressionResult, ConsentStatus, MeaningfulActionType } from './types';

export class AdService {
  private static instance: AdService;
  private configMgr: ConfigurationManager;
  private consentMgr: ConsentManager;
  private frequencyMgr: FrequencyManager;
  private bannerMgr: BannerManager;
  private interstitialMgr: InterstitialManager;
  private isInitialized: boolean = false;

  // --- Specialized User-Defined Frequency Counters ---
  private tabSwitchCount: number = 0;
  private nextTabSwitchThreshold: number = 5; // Default initial 5-10
  private scanResultCount: number = 0;
  private nextScanResultThreshold: number = 3; // Default initial 3-5
  private hasShownAppStartAd: boolean = false;

  private constructor() {
    this.configMgr = ConfigurationManager.getInstance();
    this.consentMgr = ConsentManager.getInstance();
    this.frequencyMgr = FrequencyManager.getInstance();
    this.bannerMgr = BannerManager.getInstance();
    this.interstitialMgr = InterstitialManager.getInstance();
    this.nextTabSwitchThreshold = this.getRandomInt(5, 10);
    this.nextScanResultThreshold = this.getRandomInt(3, 5);
  }

  public static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  private getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Initializes monetization architecture: restores privacy choices and commences non-blocking background asset preloading
   */
  public async init(defaultRegionCode = 'US'): Promise<void> {
    if (this.isInitialized) return;
    try {
      await this.consentMgr.init(defaultRegionCode);
      const canRequest = await this.consentMgr.canRequestAds();
      if (canRequest) {
        this.interstitialMgr.preloadInterstitial().catch((err) => {
          console.warn('[AdService] Initial background interstitial preload encountered non-fatal error:', err);
        });
      }
      this.isInitialized = true;
      console.log('[AdService] Master monetization architecture successfully initialized with zero blocking overhead.');
    } catch (e) {
      console.error('[AdService] Unhandled exception during monetization initialization:', e);
      this.isInitialized = true;
    }
  }

  // --- Banner Ad Management ---
  public async requestBanner(screenName: string, options?: AdLoadOptions): Promise<BannerLoadResult> {
    if (!this.isInitialized) await this.init();
    return await this.bannerMgr.requestBanner(screenName, options);
  }

  public releaseBanner(screenName: string): void {
    this.bannerMgr.releaseBanner(screenName);
  }

  // --- Interstitial & Action Capping Management ---
  public registerMeaningfulAction(actionType: MeaningfulActionType | string): number {
    const newCount = this.frequencyMgr.registerMeaningfulAction(actionType);
    const config = this.configMgr.getFrequencyConfig();
    if (newCount >= config.actionThreshold - 1) {
      this.interstitialMgr.preloadInterstitial().catch(() => {});
    }
    return newCount;
  }

  public async showInterstitialIfEligible(options?: { ignoreCooldown?: boolean; currentScreen?: string; triggerReason?: string }): Promise<AdImpressionResult> {
    if (!this.isInitialized) await this.init();
    try {
      return await this.interstitialMgr.showInterstitialIfEligible(options);
    } catch (err: any) {
      console.error('[AdService] Exception presenting interstitial ad; continuing app workflow gracefully:', err);
      return {
        success: false,
        type: 'INTERSTITIAL',
        errorType: 'LOAD_FAILURE',
        reason: err?.message || 'Unexpected ad presentation failure.',
      };
    }
  }

  public subscribeToInterstitial(listener: InterstitialListener): () => void {
    return this.interstitialMgr.subscribe(listener);
  }

  public dismissInterstitial(): void {
    this.interstitialMgr.dismissInterstitial();
  }

  // --- Dedicated Specialized Rule Triggers ---

  /**
   * Rule 1: Trigger full screen interstitial after 5 to 10 tab transitions
   */
  public async onTabSwitched(): Promise<void> {
    this.tabSwitchCount += 1;
    console.log(`[AdService] Tab switched (${this.tabSwitchCount}/${this.nextTabSwitchThreshold})`);
    if (this.tabSwitchCount >= this.nextTabSwitchThreshold) {
      this.tabSwitchCount = 0;
      this.nextTabSwitchThreshold = this.getRandomInt(5, 10);
      await this.showInterstitialIfEligible({
        ignoreCooldown: true,
        currentScreen: 'tab_navigation',
        triggerReason: 'Navigation Milestone (Tab Transition)',
      });
    }
  }

  /**
   * Rule 2: Trigger full screen interstitial when scan result viewed after 3 to 5 times
   */
  public async onScanResultViewed(): Promise<void> {
    this.scanResultCount += 1;
    console.log(`[AdService] Scan result viewed (${this.scanResultCount}/${this.nextScanResultThreshold})`);
    if (this.scanResultCount >= this.nextScanResultThreshold) {
      this.scanResultCount = 0;
      this.nextScanResultThreshold = this.getRandomInt(3, 5);
      await this.showInterstitialIfEligible({
        ignoreCooldown: true,
        currentScreen: 'scan_result_view',
        triggerReason: 'Scan Result Milestone Completed',
      });
    }
  }

  /**
   * Rule 3: Trigger full screen interstitial exactly 1 time on application start (with non-intrusive 2.5s delay)
   */
  public async onAppStarted(): Promise<void> {
    if (this.hasShownAppStartAd) return;
    this.hasShownAppStartAd = true;
    console.log('[AdService] Application initialization detected. Preparing 1-time app start interstitial.');
    setTimeout(async () => {
      await this.showInterstitialIfEligible({
        ignoreCooldown: true,
        currentScreen: 'app_start',
        triggerReason: 'Welcome Sponsor Display',
      });
    }, 2500);
  }

  // --- Consent & Privacy Management ---
  public async getConsentStatus(): Promise<ConsentStatus> {
    return await this.consentMgr.getConsentStatus();
  }

  public async recordUserConsent(personalized: boolean, region?: string): Promise<ConsentStatus> {
    return await this.consentMgr.recordUserConsent(personalized, region);
  }

  // --- Simulation & Testing Utilities ---
  public setTestMode(enabled: boolean): void {
    this.configMgr.setTestMode(enabled);
  }

  public isTestMode(): boolean {
    return this.configMgr.isTestMode();
  }

  public simulateNetworkOffline(offline: boolean): void {
    this.interstitialMgr.simulateNetworkOffline(offline);
    this.bannerMgr.simulateNetworkOffline(offline);
  }

  public resetAllSessionMetrics(): void {
    this.frequencyMgr.resetSessionCounters();
    this.tabSwitchCount = 0;
    this.scanResultCount = 0;
    this.hasShownAppStartAd = false;
  }

  public releaseAllResources(): void {
    this.bannerMgr.releaseAllBanners();
    this.interstitialMgr.releaseResources();
    console.log('[AdService] Master resource discharge completed. Zero active memory retention.');
  }

  // --- Sub-engine Accessors ---
  public getConfigEngine(): ConfigurationManager { return this.configMgr; }
  public getConsentEngine(): ConsentManager { return this.consentMgr; }
  public getFrequencyEngine(): FrequencyManager { return this.frequencyMgr; }
  public getBannerEngine(): BannerManager { return this.bannerMgr; }
  public getInterstitialEngine(): InterstitialManager { return this.interstitialMgr; }
}
