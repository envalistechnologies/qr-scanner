/**
 * QuickScan Enterprise Studio - Google Play Store Data Safety & Privacy Declaration Architecture
 * Phase 20: Comprehensive compliance metadata formatting for app store submission and GDPR transparency
 */

export interface DataSafetyDeclaration {
  dataCollected: Array<{
    dataType: string;
    purpose: string;
    isOptional: boolean;
    sharedWithThirdParties: boolean;
  }>;
  securityProtocols: {
    encryptedInTransit: boolean;
    canRequestDeletion: boolean;
    coppaCompliant: boolean;
  };
  policyAddendumText: string;
}

export const DATA_SAFETY_DECLARATION: DataSafetyDeclaration = {
  dataCollected: [
    {
      dataType: 'Device Or Other IDs (Advertising Identifier / IDFA / AAID)',
      purpose: 'Advertising delivery, analytical telemetry, and network fraud prevention via Google AdMob.',
      isOptional: true, // Users can opt out via OS level ad tracking settings or in-app UMP GDPR consent
      sharedWithThirdParties: true, // Shared with Google AdMob & certified mediation advertising networks
    },
    {
      dataType: 'Coarse Geographic Region (Derived from Network IP Address)',
      purpose: 'Contextual advertisement localization and language matching.',
      isOptional: false,
      sharedWithThirdParties: true,
    }
  ],
  securityProtocols: {
    encryptedInTransit: true, // All Google AdMob communication uses encrypted HTTPS/TLS protocols
    canRequestDeletion: true, // Users can purge local ad consent profiles and reset IDFA/AAID in system settings
    coppaCompliant: true,     // Explicit configuration blocks targeted advertising to minors
  },
  policyAddendumText: `
### Google AdMob & Advertising Privacy Addendum
QuickScan Enterprise Studio incorporates Google AdMob technology to present unobtrusive banner advertisements on static utility screens and occasional interstitial advertisements following completed user actions. 

1. **Strict Data Isolation**: QuickScan NEVER monitors, accesses, or shares your scanned QR code payload data, generated barcodes, local favorites vault, or scan history records with advertisers. All optical scan processing remains 100% offline and localized on your device.
2. **Advertising Identifiers**: Where permitted by local laws and your explicit GDPR/UMP consent choices, Google AdMob may utilize standard mobile advertising identifiers (AAID/IDFA) to provide relevant ad experiences and prevent ad fraud.
3. **Opt-Out Control**: You may revoke advertising personalization consent at any time from within the App Settings or through your device operating system privacy controls. When opted out, advertisements will remain contextual and non-personalized.
  `.trim(),
};

export class DataSafetyPreparation {
  private static instance: DataSafetyPreparation;

  private constructor() {}

  public static getInstance(): DataSafetyPreparation {
    if (!DataSafetyPreparation.instance) {
      DataSafetyPreparation.instance = new DataSafetyPreparation();
    }
    return DataSafetyPreparation.instance;
  }

  public getDeclaration(): DataSafetyDeclaration {
    return DATA_SAFETY_DECLARATION;
  }

  public getPolicyAddendum(): string {
    return DATA_SAFETY_DECLARATION.policyAddendumText;
  }
}
