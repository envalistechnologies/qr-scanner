/**
 * QuickScan Studio - Scan Result Factory Engine
 * Phase 14 Architectural Layer
 * Coordinates priority parser execution, malformed exception shielding, and unified structured data transformations.
 */
import { IScanParser, StandardScanResult } from './types';
import { SocialDeepLinkParser } from './modules/SocialDeepLinkParser';
import { UpiCryptoParser } from './modules/UpiCryptoParser';
import { ContactCalendarParser } from './modules/ContactCalendarParser';
import { NetworkTelecomParser } from './modules/NetworkTelecomParser';
import { WebBarcodeTextParser } from './modules/WebBarcodeTextParser';
import { sanitizeRawPayload } from './validators';

export class ScanResultFactory {
  private static parsers: IScanParser[] = [
    new SocialDeepLinkParser(),
    new UpiCryptoParser(),
    new ContactCalendarParser(),
    new NetworkTelecomParser(),
    new WebBarcodeTextParser(), // Contains universal fallbacks for Website, Barcode, Plain Text, and Unknown
  ];

  /**
   * Evaluates and processes any raw string payload captured by camera viewfinder or gallery importers.
   * Guaranteed never to throw runtime exceptions or crash UI rendering loops.
   *
   * @param raw - The unedited data string from the optical sensor or memory storage.
   * @param hardwareType - Optional camera symbold identification (e.g. 'qr', 'ean13', 'upc_a').
   */
  public static processResult(raw?: any, hardwareType: string = 'qr'): StandardScanResult {
    const cleanPayload = sanitizeRawPayload(raw);

    try {
      for (const parser of this.parsers) {
        if (parser.canParse(cleanPayload, hardwareType)) {
          return parser.parse(cleanPayload, hardwareType);
        }
      }
      // Should never reach here due to universal fallback in WebBarcodeTextParser, but provide ultimate guard
      return this.generateUnknownFallback(cleanPayload, hardwareType);
    } catch (error) {
      // Complete exception containment: degraded graceful recovery on parser failures or corrupt binary loops
      return this.generateUnknownFallback(cleanPayload, hardwareType, 'Parser Hardware Anomaly Degraded');
    }
  }

  /**
   * Generates an invincible safety model when data is entirely unrecognized or causes parsing syntax errors.
   */
  private static generateUnknownFallback(
    raw: string,
    hardwareType: string,
    errorReason: string = 'Unrecognized / Proprietary Matrix'
  ): StandardScanResult {
    return {
      contentType: 'UNKNOWN',
      displayTitle: 'Unknown Content Type',
      displaySubtitle: errorReason,
      rawValue: raw || 'Empty / Binary Sensor Transmission',
      fields: [
        { label: 'Captured Raw Payload', value: raw || '[Null Data Transmission]', icon: 'info' },
        { label: 'Diagnostic Profile', value: errorReason, icon: 'warning' },
      ],
      actions: [
        { id: 'copy_raw_unknown', label: 'Copy Raw Payload', icon: 'copy', type: 'COPY', isPrimary: true },
        { id: 'share_raw_unknown', label: 'Share Raw Data', icon: 'share', type: 'SHARE', isPrimary: false },
      ],
      metadata: {
        format: (hardwareType || 'GENERIC_MATRIX').toUpperCase(),
        errorCorrection: 'Recovered Safety Fallback',
        length: `${raw ? raw.length : 0} Bytes`,
        timestamp: Date.now(),
        hardwareType,
      },
      icon: 'warning',
      accentVariant: 'warning',
    };
  }
}
