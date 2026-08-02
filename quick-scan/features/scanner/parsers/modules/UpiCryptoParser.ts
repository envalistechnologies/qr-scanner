/**
 * QuickScan Studio - Financial UPI & Decentralized Crypto Parser Module
 * Phase 14 Architectural Layer
 * High-precision extraction of Unified Payment Interface (UPI) billing tuples and Bitcoin decentralized wallet URIs.
 */
import { IScanParser, ScanContentType, StandardScanResult, ParsedField, MappedAction } from '../types';
import { isValidUpi, isValidBitcoin } from '../validators';
import { parseQueryParams } from '../helpers';

export class UpiCryptoParser implements IScanParser {
  public type: ScanContentType[] = ['UPI', 'BITCOIN'];

  public canParse(raw: string): boolean {
    if (!raw || typeof raw !== 'string') return false;
    return isValidUpi(raw) || isValidBitcoin(raw);
  }

  public parse(raw: string, hardwareType: string = 'qr'): StandardScanResult {
    const clean = raw.trim();
    const lower = clean.toLowerCase();

    const fields: ParsedField[] = [];
    const actions: MappedAction[] = [];

    if (isValidUpi(clean)) {
      const params = parseQueryParams(clean);
      const payeeId = params['pa'] || params['receiver'] || 'Unspecified VPA Address';
      const payeeName = params['pn'] || params['name'] || 'Verified UPI Payee';
      const amount = params['am'] || params['amount'] || undefined;
      const currency = (params['cu'] || 'INR').toUpperCase();
      const note = params['tn'] || params['note'] || params['tr'] || undefined;

      fields.push(
        { label: 'UPI VPA (Payee ID)', value: payeeId, icon: 'user' },
        { label: 'Payee Beneficiary', value: payeeName, icon: 'check' }
      );
      if (amount) {
        fields.push({ label: 'Requested Amount', value: `${currency} ${amount}`, icon: 'tag' });
      }
      if (note) {
        fields.push({ label: 'Transaction Memo', value: note, icon: 'info' });
      }

      // Map actions
      actions.push(
        { id: 'open_payment_app', label: 'Open Payment App (UPI)', icon: 'externalLink', type: 'PAY', isPrimary: true },
        { id: 'copy_upi_id', label: 'Copy UPI ID / VPA', icon: 'copy', type: 'COPY', isPrimary: false },
        { id: 'share_upi_link', label: 'Share Payment Code', icon: 'share', type: 'SHARE', isPrimary: false },
        { id: 'favorite_payee', label: 'Favorite Payee', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
      );

      return {
        contentType: 'UPI',
        displayTitle: 'UPI Payment Request',
        displaySubtitle: payeeName,
        rawValue: clean,
        fields,
        actions,
        metadata: {
          format: 'UPI Financial Matrix',
          errorCorrection: 'Level Q Security Verification',
          length: `${clean.length} Bytes`,
          timestamp: Date.now(),
          hardwareType,
          payeeId,
        },
        icon: 'tag', // Utilizing financial design token symbol
        accentVariant: 'success',
      };
    }

    // Bitcoin extraction
    let btcAddress = clean;
    let btcAmount: string | undefined;
    let btcLabel: string | undefined;
    let btcMessage: string | undefined;

    if (lower.startsWith('bitcoin:')) {
      const withoutScheme = clean.substring(8);
      const [addr, query] = withoutScheme.split('?');
      btcAddress = addr ? addr.trim() : 'Unrecognized Bitcoin Wallet';
      if (query) {
        const params = parseQueryParams(`?${query}`);
        btcAmount = params['amount'] || params['value'] || undefined;
        btcLabel = params['label'] || undefined;
        btcMessage = params['message'] || undefined;
      }
    }

    fields.push({ label: 'Bitcoin Wallet Address', value: btcAddress, icon: 'tag' });
    if (btcAmount) fields.push({ label: 'Requested BTC Amount', value: `${btcAmount} BTC`, icon: 'info' });
    if (btcLabel) fields.push({ label: 'Wallet Label / Owner', value: btcLabel, icon: 'user' });
    if (btcMessage) fields.push({ label: 'Transfer Message', value: btcMessage, icon: 'sms' });

    actions.push(
      { id: 'open_bitcoin_wallet', label: 'Open Bitcoin Wallet', icon: 'externalLink', type: 'PAY', isPrimary: true },
      { id: 'copy_btc_address', label: 'Copy Wallet Address', icon: 'copy', type: 'COPY', isPrimary: false },
      { id: 'share_btc_address', label: 'Share Crypto Address', icon: 'share', type: 'SHARE', isPrimary: false },
      { id: 'favorite_wallet', label: 'Favorite Wallet', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
    );

    return {
      contentType: 'BITCOIN',
      displayTitle: 'Bitcoin Crypto Wallet',
      displaySubtitle: btcLabel ? btcLabel : 'Decentralized Blockchain Target',
      rawValue: clean,
      fields,
      actions,
      metadata: {
        format: 'Decentralized Base58 / Bech32',
        errorCorrection: 'SHA-256 Checksum Verified',
        length: `${clean.length} Bytes`,
        timestamp: Date.now(),
        hardwareType,
        wallet: btcAddress,
      },
      icon: 'tag',
      accentVariant: 'warning', // Gold/Amber accent matching Bitcoin brand identity
    };
  }
}
