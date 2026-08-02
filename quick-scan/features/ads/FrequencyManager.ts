/**
 * QuickScan Enterprise Studio - AdMob Frequency Capping & Action Tracker
 * Phase 20: Enforces strict user experience protections against interstitial ad spam and back-to-back displays
 */
import { ConfigurationManager } from './ConfigurationManager';
import { MeaningfulActionType } from './types';

export interface FrequencyEvaluation {
  permitted: boolean;
  reason?: 'SESSION_LIMIT_REACHED' | 'ACTION_THRESHOLD_UNMET' | 'COOLDOWN_ACTIVE' | 'APPROVED';
  remainingCooldownMs?: number;
  actionsRemaining?: number;
}

export class FrequencyManager {
  private static instance: FrequencyManager;
  private configManager: ConfigurationManager;
  
  private actionCounter: number = 0;
  private lastInterstitialTimestamp: number = 0;
  private sessionInterstitialCount: number = 0;
  private lastRegisteredAction: string | null = null;

  private constructor() {
    this.configManager = ConfigurationManager.getInstance();
  }

  public static getInstance(): FrequencyManager {
    if (!FrequencyManager.instance) {
      FrequencyManager.instance = new FrequencyManager();
    }
    return FrequencyManager.instance;
  }

  /**
   * Registers a meaningful completed user action (such as saving a generator template or exporting CSV archives)
   */
  public registerMeaningfulAction(actionType: MeaningfulActionType | string): number {
    if (!this.configManager.isActionEligibleForInterstitial(actionType)) {
      console.warn(`[FrequencyManager] Action "${actionType}" is unapproved for ad metrics. Ignoring.`);
      return this.actionCounter;
    }
    this.actionCounter += 1;
    this.lastRegisteredAction = actionType;
    console.log(`[FrequencyManager] Registered meaningful action: "${actionType}" | Current session accumulation: ${this.actionCounter}`);
    return this.actionCounter;
  }

  /**
   * Evaluates whether an interstitial ad display is permitted under configured timing cooldowns and frequency ceilings
   */
  public evaluateInterstitialEligibility(ignoreCooldown = false): FrequencyEvaluation {
    const freqConfig = this.configManager.getFrequencyConfig();

    // 1. Enforce Maximum Session Impression Cap
    if (this.sessionInterstitialCount >= freqConfig.maxInterstitialsPerSession) {
      return {
        permitted: false,
        reason: 'SESSION_LIMIT_REACHED',
      };
    }

    // 2. Enforce Action Count Threshold (e.g. require at least 3 meaningful actions between ads)
    if (this.actionCounter < freqConfig.actionThreshold) {
      return {
        permitted: false,
        reason: 'ACTION_THRESHOLD_UNMET',
        actionsRemaining: freqConfig.actionThreshold - this.actionCounter,
      };
    }

    // 3. Enforce Temporal Cooldown between Interstitials (e.g. minimum 2.5 minutes between ads)
    const elapsedMs = Date.now() - this.lastInterstitialTimestamp;
    if (!ignoreCooldown && this.lastInterstitialTimestamp > 0 && elapsedMs < freqConfig.interstitialCooldownMs) {
      const remainingCooldownMs = freqConfig.interstitialCooldownMs - elapsedMs;
      return {
        permitted: false,
        reason: 'COOLDOWN_ACTIVE',
        remainingCooldownMs,
      };
    }

    return {
      permitted: true,
      reason: 'APPROVED',
      actionsRemaining: 0,
      remainingCooldownMs: 0,
    };
  }

  /**
   * Records a successful interstitial impression: resets action counter to zero to guarantee no back-to-back spam
   */
  public recordInterstitialShown(): void {
    this.lastInterstitialTimestamp = Date.now();
    this.actionCounter = 0; // Absolute reset: forces user to perform new actions before any subsequent ad
    this.sessionInterstitialCount += 1;
    console.log(`[FrequencyManager] Interstitial impression recorded. Session total: ${this.sessionInterstitialCount}. Action buffer reset.`);
  }

  public getActionCount(): number {
    return this.actionCounter;
  }

  public getSessionImpressionCount(): number {
    return this.sessionInterstitialCount;
  }

  public getLastAction(): string | null {
    return this.lastRegisteredAction;
  }

  public resetSessionCounters(): void {
    this.actionCounter = 0;
    this.lastInterstitialTimestamp = 0;
    this.sessionInterstitialCount = 0;
    this.lastRegisteredAction = null;
    console.log('[FrequencyManager] Session metrics cleanly reset to default initial baseline.');
  }
}
