/**
 * QuickScan Enterprise Studio - Master Google AdMob & Monetization Configuration
 * Phase 20 Architectural Layer: Compliant with Google Play & AdMob Policies, GDPR/UMP Privacy, and UX Best Practices
 */

export interface AdUnitConfig {
  banner: string;
  interstitial: string;
}

export interface AdFrequencyConfig {
  /** Minimum delay in milliseconds between interstitial ad impressions (Default: 2.5 minutes) */
  interstitialCooldownMs: number;
  /** Number of meaningful completed user actions required before triggering an interstitial ad */
  actionThreshold: number;
  /** Maximum total interstitial ads permitted per app session to prevent ad fatigue */
  maxInterstitialsPerSession: number;
  /** Timeout in milliseconds before canceling an ad load attempt and continuing gracefully */
  adLoadTimeoutMs: number;
}

export interface AdPolicyConfig {
  /** List of route identifiers where Banner ads are explicitly permitted */
  allowedBannerScreens: string[];
  /** Strict exclusion list of screens where ads are permanently forbidden by Google Play policy & UX best practices */
  forbiddenScreens: string[];
}

export interface AdConsentConfig {
  /** If true, only requests GDPR/UMP privacy consent in EEA/UK regions where legally mandatory */
  eeaOnlyConsent: boolean;
  /** Indicates if the application should apply Under Age of Consent (COPPA) tags to ad requests */
  tagForUnderAgeOfConsent: boolean;
  /** Indicates if Personalized ads are allowed by default prior to user opt-in */
  defaultToPersonalized: boolean;
}

export interface MonetizationConfig {
  isTestMode: boolean;
  testUnitIds: { android: AdUnitConfig; ios: AdUnitConfig };
  productionUnitIds: { android: AdUnitConfig; ios: AdUnitConfig };
  frequency: AdFrequencyConfig;
  policy: AdPolicyConfig;
  consent: AdConsentConfig;
}

/**
 * Official Google AdMob Dedicated Test Ad Unit IDs
 * Safe for automated CI testing, Expo Go emulation, and pre-release validation
 */
export const ADMOB_TEST_IDS = {
  android: {
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
  },
  ios: {
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
  },
};

/**
 * Production Ad Unit IDs assigned to Envalis Technologies
 * Replace these placeholder strings with verified Google AdMob publisher codes prior to store submission
 */
export const ADMOB_PROD_IDS = {
  android: {
    banner: 'ca-app-pub-7583323986111464/9659495020',
    interstitial: 'ca-app-pub-7583323986111464/5173455105',
  },
  ios: {
    banner: 'ca-app-pub-0000000000000000/0000000003',
    interstitial: 'ca-app-pub-0000000000000000/0000000004',
  },
};

export const ADS_CONFIG: MonetizationConfig = {
  // Use Test Mode only when __DEV__ is true; default to false for production release builds
  isTestMode: typeof __DEV__ !== 'undefined' ? __DEV__ : false,
  testUnitIds: ADMOB_TEST_IDS,
  productionUnitIds: ADMOB_PROD_IDS,
  
  frequency: {
    interstitialCooldownMs: 150 * 1000, // 2 minutes 30 seconds between interstitials
    actionThreshold: 3,                 // Trigger interstitial after every 3rd completed meaningful action
    maxInterstitialsPerSession: 5,      // Maximum 5 interstitials per active user session
    adLoadTimeoutMs: 5000,              // 5-second maximum ad network fallback window
  },

  policy: {
    // Permitted screens for unobtrusive bottom banner placement
    allowedBannerScreens: [
      'home',
      'history',
      'favorites',
      'settings',
      'generator',
      '(tabs)/index',
      '(tabs)/history',
      '(tabs)/favorites',
      '(tabs)/settings',
      '(tabs)/generator',
      'bottom_tab_container',
      'tabs',
    ],
    // STRICT EXCLUSION: Never display ads on live optical scanning, camera view, splash, onboarding, or permission prompts
    forbiddenScreens: [
      'scanner',
      'camera',
      'permission',
      'splash',
      'onboarding',
    ],
  },

  consent: {
    eeaOnlyConsent: true,
    tagForUnderAgeOfConsent: false,
    defaultToPersonalized: false,
  },
};

/**
 * Safely evaluates target operating system without crashing Node test execution harnesses or Expo Go
 */
export function getPlatformOS(): 'ios' | 'android' {
  try {
    if (typeof global !== 'undefined' && (global as any).__fbBatchedBridge) {
      const rnModule = 'react' + '-native';
      const rn = require(rnModule);
      return rn?.Platform?.OS === 'ios' ? 'ios' : 'android';
    }
  } catch {
    // Ignore dynamic binding failure in non-native environments
  }
  return 'android';
}

/**
 * Helper utility to securely fetch active Ad Unit ID based on OS runtime and environment mode
 */
export function getActiveAdUnitId(type: 'banner' | 'interstitial'): string {
  const platform = getPlatformOS();
  const unitGroup = ADS_CONFIG.isTestMode ? ADS_CONFIG.testUnitIds[platform] : ADS_CONFIG.productionUnitIds[platform];
  return unitGroup[type];
}

/**
 * Validates whether a specific navigation route is permitted to render banner advertisements under Google Play Policy
 */
export function isScreenAdPermitted(screenName: string): boolean {
  if (!screenName) return false;
  const normalized = screenName.toLowerCase().trim();
  const isForbidden = ADS_CONFIG.policy.forbiddenScreens.some((s) => normalized.includes(s.toLowerCase()));
  if (isForbidden) return false;
  return ADS_CONFIG.policy.allowedBannerScreens.some((s) => normalized.includes(s.toLowerCase()));
}
