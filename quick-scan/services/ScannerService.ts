/**
 * QuickScan Studio - Scanner Service
 * Phase 13 Real-Time Detection Engine & Symbology Translator
 * Note: Performs rapid identification only. Detailed structured parsing occurs in Phase 14.
 */
import { ScanResult, SymbologyType, QRCodeType, BarcodeType } from '../types/domain';
import { generateUUID } from '../utils/strings';

export class ScannerService {
  private static instance: ScannerService;

  private constructor() { }

  public static getInstance(): ScannerService {
    if (!ScannerService.instance) {
      ScannerService.instance = new ScannerService();
    }
    return ScannerService.instance;
  }

  /**
   * Returns the complete array of supported optical symbologies for expo-camera SDK 54.
   */
  public getSupportedBarcodeTypes(): string[] {
    return [
      'qr',
      'ean13',
      'ean8',
      'upc_a',
      'upc_e',
      'code39',
      'code93',
      'code128',
      'itf14',
      'codabar',
      'pdf417',
      'aztec',
      'datamatrix',
    ];
  }

  /**
   * Processes live camera optical frames into standardized domain ScanResult objects.
   * Classifies symbology instantly without performing computationally expensive field parsing.
   */
  public processBarcodeScan(rawType: string, rawData: string): ScanResult | null {
    if (!rawData || typeof rawData !== 'string') {
      return null;
    }

    const normalizedType = rawType.toLowerCase().trim();
    const isQR = normalizedType === 'qr' || normalizedType.includes('qr_code');

    let symbology: SymbologyType = 'UNKNOWN';

    if (isQR) {
      symbology = this.classifyQRSymbology(rawData);
    } else {
      symbology = this.mapBarcodeSymbology(normalizedType);
    }

    const displayTitle = this.formatDisplayTitle(isQR, symbology, rawData);

    return {
      id: generateUUID(),
      rawValue: rawData,
      displayTitle,
      symbology,
      isQR,
      timestamp: Date.now(),
      metadata: {
        rawHardwareType: rawType,
        byteLength: rawData.length,
      },
    };
  }

  /**
   * Identifies QR code payload category by universal RFC URI schemes and standard prefixes.
   * Does not parse structured internal data parameters (reserved for Phase 14).
   */
  private classifyQRSymbology(payload: string): QRCodeType {
    const trimmed = payload.trim();
    const upper = trimmed.toUpperCase();

    // 1. WiFi Network Configurations
    if (upper.startsWith('WIFI:') || upper.startsWith('WPA:')) {
      return 'WIFI';
    }
    // 2. vCard & MeCard Digital Contact Business Cards
    if (upper.startsWith('BEGIN:VCARD') || upper.startsWith('MECARD:')) {
      return 'VCARD';
    }
    // 3. iCalendar & vEvent Scheduling
    if (upper.startsWith('BEGIN:VEVENT') || upper.startsWith('BEGIN:VCALENDAR')) {
      return 'CALENDAR';
    }
    // 4. WhatsApp Direct Links & Schemes
    if (
      upper.startsWith('WHATSAPP:') ||
      trimmed.includes('wa.me/') ||
      trimmed.includes('api.whatsapp.com') ||
      trimmed.includes('web.whatsapp.com')
    ) {
      return 'WHATSAPP';
    }
    // 5. Social Media Hubs
    if (
      trimmed.includes('instagram.com/') ||
      trimmed.includes('facebook.com/') ||
      trimmed.includes('twitter.com/') ||
      trimmed.includes('x.com/') ||
      trimmed.includes('linkedin.com/') ||
      trimmed.includes('youtube.com/') ||
      trimmed.includes('tiktok.com/') ||
      trimmed.includes('github.com/') ||
      trimmed.includes('t.me/') ||
      trimmed.includes('telegram.me/') ||
      trimmed.includes('snapchat.com/')
    ) {
      return 'SOCIAL';
    }
    // 6. Universal Web URLs
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('www.')) {
      return 'URL';
    }
    // 7. Email URI Protocols
    if (upper.startsWith('MAILTO:') || upper.startsWith('SMTP:')) {
      return 'EMAIL';
    }
    // 8. Telephone Dialers
    if (upper.startsWith('TEL:') || upper.startsWith('TELNET:')) {
      return 'PHONE';
    }
    // 9. SMS & MMS Dispatchers
    if (upper.startsWith('SMSTO:') || upper.startsWith('SMS:') || upper.startsWith('MMSTO:')) {
      return 'SMS';
    }
    // 10. Geographic GPS Coordinates
    if (upper.startsWith('GEO:') || upper.startsWith('LOCATION:')) {
      return 'GEO';
    }

    // 11. Fallback Universal Plain Text
    return 'TEXT';
  }

  /**
   * Maps expo-camera native hardware symbology strings to domain BarcodeType values.
   */
  private mapBarcodeSymbology(hardwareType: string): BarcodeType {
    switch (hardwareType) {
      case 'ean13':
      case 'ean-13':
        return 'EAN_13';
      case 'ean8':
      case 'ean-8':
        return 'EAN_8';
      case 'upc_a':
      case 'upc-a':
      case 'upca':
        return 'UPC_A';
      case 'upc_e':
      case 'upc-e':
      case 'upce':
        return 'UPC_E';
      case 'code39':
      case 'code-39':
        return 'CODE_39';
      case 'code93':
      case 'code-93':
        return 'CODE_93';
      case 'code128':
      case 'code-128':
        return 'CODE_128';
      case 'itf14':
      case 'itf':
      case 'interleaved2of5':
        return 'ITF';
      case 'codabar':
        return 'CODABAR';
      case 'pdf417':
      case 'pdf-417':
        return 'PDF_417';
      case 'datamatrix':
      case 'data-matrix':
        return 'DATA_MATRIX';
      case 'aztec':
        return 'AZTEC';
      default:
        return 'CODE_128';
    }
  }

  /**
   * Generates a clean human-readable summary display title for the scanned item.
   */
  private formatDisplayTitle(isQR: boolean, symbology: SymbologyType, payload: string): string {
    const cleanSnippet = payload.length > 28 ? `${payload.substring(0, 26)}...` : payload;
    if (isQR) {
      return `${symbology} • ${cleanSnippet}`;
    }
    return `Barcode (${symbology}) • ${cleanSnippet}`;
  }

  // --- Phase 11 & Backward Compatibility Stubs ---
  public async scanFromCamera(frameBuffer?: any): Promise<ScanResult | null> {
    return {
      id: generateUUID(),
      rawValue: 'https://envalis.technologies.studio/enterprise',
      displayTitle: 'URL • https://envalis.te...',
      symbology: 'URL',
      isQR: true,
      timestamp: Date.now(),
    };
  }

  public async scanFromGallery(imageUri?: string): Promise<ScanResult | null> {
    return null;
  }

  public async toggleTorch(active: boolean): Promise<void> {
    return Promise.resolve();
  }
}
