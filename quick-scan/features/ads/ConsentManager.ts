/**
 * QuickScan Enterprise Studio - AdMob Consent & Privacy Manager
 * Phase 20: Manages UMP/GDPR regional consent evaluations and persists advertising privacy preferences
 */
import { StorageService } from '../../storage/StorageService';
import { ConsentStatus } from './types';

interface StoredConsentData {
  status: ConsentStatus;
  timestamp: number;
  region?: string;
  isPersonalized: boolean;
}

export class ConsentManager {
  private static instance: ConsentManager;
  private static readonly KEY_CONSENT_VAULT = 'admob_privacy_consent_vault_v1';
  private storage: StorageService;
  private currentStatus: ConsentStatus = 'UNKNOWN';
  private isEEARegion: boolean = false;

  private constructor() {
    this.storage = StorageService.getInstance();
  }

  public static getInstance(): ConsentManager {
    if (!ConsentManager.instance) {
      ConsentManager.instance = new ConsentManager();
    }
    return ConsentManager.instance;
  }

  public async init(defaultRegionCode: string = 'US'): Promise<ConsentStatus> {
    try {
      const saved = await this.storage.getItem<StoredConsentData | null>(ConsentManager.KEY_CONSENT_VAULT, null);
      if (saved && saved.status) {
        this.currentStatus = saved.status;
        return this.currentStatus;
      }

      return await this.evaluateJurisdiction(defaultRegionCode);
    } catch (e) {
      console.warn('[ConsentManager] Error reading consent vault, falling back to non-EEA default:', e);
      this.currentStatus = 'NOT_REQUIRED_NON_EEA';
      return this.currentStatus;
    }
  }

  /**
   * Evaluates user regional jurisdiction to verify if GDPR / European UMP dialogs are legally mandated
   */
  public async evaluateJurisdiction(regionCode: string): Promise<ConsentStatus> {
    const eeaCountries = [
      'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
      'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
      'SE', 'GB', 'UK', 'CH', 'IS', 'LI', 'NO', 'EEA'
    ];

    const normalized = (regionCode || 'US').toUpperCase().trim();
    this.isEEARegion = eeaCountries.includes(normalized);

    if (!this.isEEARegion) {
      this.currentStatus = 'NOT_REQUIRED_NON_EEA';
      await this.saveConsentState('NOT_REQUIRED_NON_EEA', true, normalized);
    } else {
      // In EEA jurisdiction, consent remains UNKNOWN until explicit opt-in/out occurs
      this.currentStatus = 'UNKNOWN';
    }
    return this.currentStatus;
  }

  /**
   * Records explicit user consent choice (Personalized vs Non-Personalized / Contextual advertisements)
   */
  public async recordUserConsent(personalized: boolean, region: string = 'EEA'): Promise<ConsentStatus> {
    const status: ConsentStatus = personalized ? 'OBTAINED_PERSONALIZED' : 'OBTAINED_NON_PERSONALIZED';
    this.currentStatus = status;
    await this.saveConsentState(status, personalized, region);
    console.log(`[ConsentManager] Registered user ad consent preference: ${status}`);
    return status;
  }

  public async getConsentStatus(): Promise<ConsentStatus> {
    if (this.currentStatus === 'UNKNOWN') {
      await this.init();
    }
    return this.currentStatus;
  }

  public async canRequestAds(): Promise<boolean> {
    const status = await this.getConsentStatus();
    // Ads can be requested unless strictly denied or COPPA restricted; non-personalized ads remain permissible under GDPR
    return status !== 'DENIED_LIMITED';
  }

  public isPersonalizationPermitted(): boolean {
    return this.currentStatus === 'OBTAINED_PERSONALIZED' || this.currentStatus === 'NOT_REQUIRED_NON_EEA';
  }

  public async resetConsent(): Promise<void> {
    this.currentStatus = 'UNKNOWN';
    await this.storage.removeItem(ConsentManager.KEY_CONSENT_VAULT);
    console.log('[ConsentManager] Privacy consent state cleared.');
  }

  private async saveConsentState(status: ConsentStatus, isPersonalized: boolean, region?: string): Promise<void> {
    const payload: StoredConsentData = {
      status,
      timestamp: Date.now(),
      region,
      isPersonalized,
    };
    try {
      await this.storage.setItem(ConsentManager.KEY_CONSENT_VAULT, payload);
    } catch (e) {
      console.error('[ConsentManager] Exception committing consent record:', e);
    }
  }
}
