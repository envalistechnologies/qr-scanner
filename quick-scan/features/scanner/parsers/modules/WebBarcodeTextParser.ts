/**
 * QuickScan Studio - Website, Hardware Barcode & Plain Text Parser Module
 * Phase 14 Architectural Layer
 * Coordinates general Web URLs, industrial physical retail barcodes, plain UTF-8 text memos, and safe fallback representations for unknown formats.
 */
import { IScanParser, ScanContentType, StandardScanResult, ParsedField, MappedAction } from '../types';
import { isValidUrl, isLinearBarcodeType, safeExtractDomain } from '../validators';
import { IconName, icons } from '../../../../theme/icons';

export class WebBarcodeTextParser implements IScanParser {
  public type: ScanContentType[] = ['WEBSITE', 'BARCODE', 'PLAIN_TEXT', 'UNKNOWN'];

  public canParse(raw: string, hardwareType?: string): boolean {
    // Because this parser contains our safe catch-all Plain Text & Unknown fallback, it evaluates to true for any non-null input
    return !!raw && typeof raw === 'string';
  }

  public parse(raw: string, hardwareType: string = 'qr'): StandardScanResult {
    const clean = (raw || '').trim();

    let contentType: ScanContentType = 'PLAIN_TEXT';
    let title = 'Plain UTF-8 Text Memo';
    let subtitle = 'Text Document / Notepad Data';
    let icon: IconName | keyof typeof icons = 'text';
    let accentVariant: 'primary' | 'success' | 'warning' | 'info' | 'error' = 'info';
    const fields: ParsedField[] = [];
    const actions: MappedAction[] = [];

    // Check if hardware scanner sensor designated a linear industrial barcode (UPC, EAN, Code128, etc.)
    if (isLinearBarcodeType(hardwareType)) {
      contentType = 'BARCODE';
      title = `Retail Barcode (${(hardwareType || 'LINEAR').toUpperCase()})`;
      subtitle = `Product Identifier: ${clean}`;
      icon = 'barcode';
      accentVariant = 'primary';

      fields.push(
        { label: 'Hardware Barcode Symbology', value: (hardwareType || 'Universal Barcode').toUpperCase(), icon: 'barcode' },
        { label: 'Scanned Digits / Value', value: clean, icon: 'tag' },
        { label: 'Digit String Length', value: `${clean.length} Characters`, icon: 'info' }
      );

      actions.push(
        { id: 'search_product', label: 'Search Product Online', icon: 'search', type: 'OPEN', isPrimary: true },
        { id: 'copy_barcode', label: 'Copy Barcode Digits', icon: 'copy', type: 'COPY', isPrimary: false },
        { id: 'share_barcode', label: 'Share Barcode Value', icon: 'share', type: 'SHARE', isPrimary: false },
        { id: 'favorite_barcode', label: 'Favorite Barcode Item', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
      );

      return {
        contentType,
        displayTitle: title,
        displaySubtitle: subtitle,
        rawValue: clean,
        fields,
        actions,
        metadata: {
          format: (hardwareType || 'LINEAR').toUpperCase(),
          errorCorrection: 'Hardware Laser Checksum',
          length: `${clean.length} Characters`,
          timestamp: Date.now(),
          hardwareType,
        },
        icon,
        accentVariant,
      };
    }

    // Check if general Web URL
    if (isValidUrl(clean) || clean.toLowerCase().startsWith('http://') || clean.toLowerCase().startsWith('https://')) {
      contentType = 'WEBSITE';
      title = 'Website URL Link';
      const domain = safeExtractDomain(clean);
      subtitle = domain ? `Domain: ${domain}` : 'Interactive World Wide Web Link';
      icon = 'url';
      accentVariant = 'primary';

      const protocol = clean.toLowerCase().startsWith('https://')
        ? 'HTTPS (Transport Layer Security)'
        : clean.toLowerCase().startsWith('http://')
          ? 'HTTP (Standard Transfer Protocol)'
          : 'Implicit HTTPS Web Route';

      fields.push(
        { label: 'Target Web Domain', value: domain || 'Standard Web Host', icon: 'url' },
        { label: 'Complete URL Address', value: clean, icon: 'externalLink' },
        { label: 'Network Transport Protocol', value: protocol, icon: 'secure' },
        { label: 'Web Page Document Title', value: `[Verified Website: ${domain}]`, icon: 'info' }
      );

      actions.push(
        { id: 'open_url', label: 'Open in Web Browser', icon: 'externalLink', type: 'OPEN', isPrimary: true },
        { id: 'copy_url', label: 'Copy Web Address', icon: 'copy', type: 'COPY', isPrimary: false },
        { id: 'share_url', label: 'Share Web Link', icon: 'share', type: 'SHARE', isPrimary: false },
        { id: 'favorite_url', label: 'Favorite Website', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
      );

      return {
        contentType,
        displayTitle: title,
        displaySubtitle: subtitle,
        rawValue: clean,
        fields,
        actions,
        metadata: {
          format: 'Web URL Routing Schema',
          errorCorrection: 'Level H Redundancy Check',
          length: `${clean.length} Bytes`,
          timestamp: Date.now(),
          hardwareType,
          domain,
        },
        icon,
        accentVariant,
      };
    }

    // Evaluate if data appears garbled or unrecognized binary/unknown format vs clean ASCII/Unicode Text
    const isGarbled = !clean || /^[\x00-\x08\x0E-\x1F\x7F-\x9F]+$/.test(clean);

    if (isGarbled || !clean) {
      contentType = 'UNKNOWN';
      title = 'Unknown Content Type';
      subtitle = 'Unrecognized / Binary Data Schema';
      icon = 'warning';
      accentVariant = 'warning';

      fields.push(
        { label: 'Captured Raw Bytes', value: clean || '[Empty Sensor Transmission]', icon: 'info' },
        { label: 'Schema Classification', value: 'Unidentified custom proprietary format', icon: 'warning' }
      );

      actions.push(
        { id: 'copy_unknown', label: 'Copy Raw Payload', icon: 'copy', type: 'COPY', isPrimary: true },
        { id: 'share_unknown', label: 'Share Raw Data', icon: 'share', type: 'SHARE', isPrimary: false }
      );
    } else {
      // Standard Plain Text
      contentType = 'PLAIN_TEXT';
      title = 'Plain UTF-8 Text Memo';
      subtitle = clean.length > 35 ? `${clean.substring(0, 35)}...` : clean;
      icon = 'text';
      accentVariant = 'info';

      fields.push(
        { label: 'Decoded Text Memo', value: clean, icon: 'text' },
        { label: 'Character Count', value: `${clean.length} Characters`, icon: 'info' },
        { label: 'Character Encoding', value: 'Standard UTF-8 / Universal Text', icon: 'tag' }
      );

      actions.push(
        { id: 'copy_text_memo', label: 'Copy Decoded Text', icon: 'copy', type: 'COPY', isPrimary: true },
        { id: 'share_text_memo', label: 'Share Text Memo', icon: 'share', type: 'SHARE', isPrimary: false },
        { id: 'favorite_text_memo', label: 'Favorite Memo', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
      );
    }

    return {
      contentType,
      displayTitle: title,
      displaySubtitle: subtitle,
      rawValue: clean || 'Empty Raw Payload',
      fields,
      actions,
      metadata: {
        format: `${contentType} Basic Representation`,
        errorCorrection: 'Standard Hardware Parity',
        length: `${clean ? clean.length : 0} Bytes`,
        timestamp: Date.now(),
        hardwareType,
      },
      icon,
      accentVariant,
    };
  }
}
