/**
 * QuickScan Studio - Scan Result Processing Engine Types
 * Phase 14 Architectural Definition
 * Strictly typed interfaces for all 21 supported scan formats, extracted fields, and mapped actions.
 */
import { IconName, icons } from '../../../theme/icons';

export type ScanContentType =
  | 'PLAIN_TEXT'
  | 'WEBSITE'
  | 'EMAIL'
  | 'PHONE'
  | 'SMS'
  | 'WIFI'
  | 'VCARD'
  | 'GEO'
  | 'CALENDAR'
  | 'WHATSAPP'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'LINKEDIN'
  | 'YOUTUBE'
  | 'GOOGLE_MAPS'
  | 'APP_STORE'
  | 'PLAY_STORE'
  | 'BITCOIN'
  | 'UPI'
  | 'BARCODE'
  | 'UNKNOWN';

export interface ParsedField {
  /** Display label for the extracted parameter (e.g. "SSID", "UPI ID", "Latitude"). */
  label: string;
  /** Clean extracted textual value. */
  value: string;
  /** Optional Material Community icon representing this field. */
  icon?: IconName | keyof typeof icons;
}

export interface MappedAction {
  /** Unique action identifier (e.g. "OPEN_URL", "COPY_PASS", "PAY_UPI"). */
  id: string;
  /** Human readable interactive action button title. */
  label: string;
  /** Icon symbol mapping. */
  icon: IconName | keyof typeof icons;
  /** Functional category for execution engines in Phase 15. */
  type: 'OPEN' | 'COPY' | 'SHARE' | 'CONNECT' | 'CALL' | 'COMPOSE' | 'FAVORITE' | 'PAY' | 'MAP' | 'GENERATE' | 'CUSTOM';
  /** Whether this action deserves primary elevated styling vs secondary/grid formatting. */
  isPrimary?: boolean;
}

export interface StandardScanResult {
  /** The specific identified content architecture out of the 21 supported types. */
  contentType: ScanContentType;
  /** Clean summary header for the result card (e.g. "Wi-Fi Access Network"). */
  displayTitle: string;
  /** Supporting subtitle or category identifier. */
  displaySubtitle: string;
  /** Exact raw data string captured by optical sensors or image importers. */
  rawValue: string;
  /** Complete list of extracted structured information parameters. */
  fields: ParsedField[];
  /** Mapped available interactive actions ready for execution handoff. */
  actions: MappedAction[];
  /** Technical formatting attributes for hardware profiling. */
  metadata: {
    format: string;
    errorCorrection: string;
    length: string;
    timestamp: number;
    hardwareType?: string;
    [key: string]: any;
  };
  /** Main representation icon for this content type. */
  icon: IconName | keyof typeof icons;
  /** Design color token variant for status indicators and visual chips. */
  accentVariant: 'primary' | 'success' | 'warning' | 'info' | 'error';
}

export interface IScanParser {
  /** The primary content type (or cluster of types) governed by this parser. */
  type: ScanContentType | ScanContentType[];
  /** Evaluates whether the raw string payload conforms to this parser's schema. */
  canParse(raw: string, hardwareType?: string): boolean;
  /** Extracts structured fields and maps available actions cleanly into StandardScanResult. */
  parse(raw: string, hardwareType?: string): StandardScanResult;
}
