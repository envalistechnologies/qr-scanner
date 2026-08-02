/**
 * QuickScan Studio - Network & Telecom Parser Module
 * Phase 14 Architectural Layer
 * Specialized extraction for wireless networking configuration profiles (Wi-Fi), email communication tuples, telephone dialing links, and SMS payloads.
 */
import { IScanParser, ScanContentType, StandardScanResult, ParsedField, MappedAction } from '../types';
import { isValidEmail, isValidPhoneNumber } from '../validators';
import { parseWifiPayload, parseQueryParams, safeDecode } from '../helpers';
import { IconName, icons } from '../../../../theme/icons';

export class NetworkTelecomParser implements IScanParser {
  public type: ScanContentType[] = ['WIFI', 'EMAIL', 'PHONE', 'SMS'];

  public canParse(raw: string): boolean {
    if (!raw || typeof raw !== 'string') return false;
    const clean = raw.trim();
    const lower = clean.toLowerCase();

    return (
      lower.startsWith('wifi:') ||
      lower.startsWith('mailto:') ||
      lower.startsWith('tel:') ||
      lower.startsWith('telnet:') ||
      lower.startsWith('sms:') ||
      lower.startsWith('smsto:') ||
      isValidEmail(clean) ||
      (clean.startsWith('+') && isValidPhoneNumber(clean))
    );
  }

  public parse(raw: string, hardwareType: string = 'qr'): StandardScanResult {
    const clean = raw.trim();
    const lower = clean.toLowerCase();

    let contentType: ScanContentType = 'WIFI';
    let title = 'Wi-Fi Access Network';
    let subtitle = 'Wireless Configuration Matrix';
    let icon: IconName | keyof typeof icons = 'wifi';
    let accentVariant: 'primary' | 'success' | 'warning' | 'info' | 'error' = 'info';
    const fields: ParsedField[] = [];
    const actions: MappedAction[] = [];
    let primaryLabel = 'Connect to Wi-Fi Network';
    let primaryType: 'OPEN' | 'COPY' | 'SHARE' | 'CONNECT' | 'CALL' | 'COMPOSE' | 'FAVORITE' | 'PAY' = 'CONNECT';

    if (lower.startsWith('wifi:')) {
      contentType = 'WIFI';
      title = 'Wi-Fi Access Network';
      icon = 'wifi';
      accentVariant = 'info';
      primaryLabel = 'Connect to Wi-Fi Network';
      primaryType = 'CONNECT';

      const wifi = parseWifiPayload(clean);
      subtitle = wifi.ssid ? `Network: ${wifi.ssid}` : 'Wireless Network Configuration';

      fields.push(
        { label: 'Network SSID (Name)', value: wifi.ssid || 'Unknown Network', icon: 'wifi' },
        { label: 'Security Encryption', value: wifi.encryption, icon: 'privacy' },
        { label: 'Hidden SSID Broadcast', value: wifi.hidden ? 'Yes (Hidden Network)' : 'No (Visible Broadcast)', icon: 'info' }
      );

      if (wifi.password) {
        fields.push({ label: 'Wi-Fi Password / Passphrase', value: wifi.password, icon: 'secure' });
      }

      actions.push(
        { id: 'connect_wifi', label: primaryLabel, icon: 'wifi', type: primaryType, isPrimary: true },
        { id: 'copy_wifi_pass', label: wifi.password ? 'Copy Wi-Fi Password' : 'Copy Network SSID', icon: 'copy', type: 'COPY', isPrimary: false },
        { id: 'share_wifi', label: 'Share Network Access Card', icon: 'share', type: 'SHARE', isPrimary: false },
        { id: 'favorite_wifi', label: 'Favorite Wi-Fi Network', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
      );
    } else if (lower.startsWith('mailto:') || isValidEmail(clean)) {
      contentType = 'EMAIL';
      title = 'Email Message & Recipient';
      icon = 'email';
      accentVariant = 'primary';
      primaryLabel = 'Compose Email Message';
      primaryType = 'COMPOSE';

      let emailAddress = clean;
      let subject = '';
      let body = '';

      if (lower.startsWith('mailto:')) {
        const withoutScheme = clean.substring(7);
        const [addr, query] = withoutScheme.split('?');
        emailAddress = addr ? safeDecode(addr.trim()) : '';
        if (query) {
          const params = parseQueryParams(`?${query}`);
          subject = params['subject'] || '';
          body = params['body'] || '';
        }
      }

      subtitle = emailAddress || 'Electronic Correspondence';
      fields.push({ label: 'Recipient Email Address', value: emailAddress, icon: 'email' });
      if (subject) fields.push({ label: 'Message Subject Line', value: subject, icon: 'tag' });
      if (body) fields.push({ label: 'Pre-filled Email Body', value: body, icon: 'text' });

      actions.push(
        { id: 'compose_email', label: primaryLabel, icon: 'email', type: primaryType, isPrimary: true },
        { id: 'copy_email', label: 'Copy Email Address', icon: 'copy', type: 'COPY', isPrimary: false },
        { id: 'share_email', label: 'Share Contact Address', icon: 'share', type: 'SHARE', isPrimary: false },
        { id: 'favorite_email', label: 'Favorite Email Recipient', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
      );
    } else if (lower.startsWith('sms:') || lower.startsWith('smsto:')) {
      contentType = 'SMS';
      title = 'SMS Messaging Payload';
      icon = 'sms';
      accentVariant = 'success';
      primaryLabel = 'Open SMS Messenger';
      primaryType = 'COMPOSE';

      const withoutScheme = clean.replace(/^(smsto:|sms:)/i, '');
      const [phonePart, queryOrBody] = withoutScheme.split(/[?:]/);
      const phone = phonePart ? phonePart.trim() : '';
      let msg = '';

      if (clean.includes('?')) {
        const params = parseQueryParams(clean.substring(clean.indexOf('?')));
        msg = params['body'] || params['text'] || '';
      } else if (queryOrBody && !clean.includes('?')) {
        msg = safeDecode(queryOrBody.trim());
      }

      subtitle = phone ? `Recipient: ${phone}` : 'Short Message Service';
      if (phone) fields.push({ label: 'Destination Phone Number', value: phone, icon: 'phone' });
      if (msg) fields.push({ label: 'SMS Message Content', value: msg, icon: 'sms' });
      fields.push({ label: 'Protocol URI', value: clean, icon: 'tag' });

      actions.push(
        { id: 'send_sms', label: primaryLabel, icon: 'sms', type: primaryType, isPrimary: true },
        { id: 'copy_sms_body', label: msg ? 'Copy Message Text' : 'Copy Phone Number', icon: 'copy', type: 'COPY', isPrimary: false },
        { id: 'share_sms', label: 'Share SMS Payload', icon: 'share', type: 'SHARE', isPrimary: false },
        { id: 'favorite_sms', label: 'Favorite Message Template', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
      );
    } else {
      // PHONE parsing (tel: or direct validated international number)
      contentType = 'PHONE';
      title = 'Telephone Call Action';
      icon = 'phone';
      accentVariant = 'primary';
      primaryLabel = 'Initiate Phone Call';
      primaryType = 'CALL';

      const digits = clean.replace(/^(tel:|telnet:)/i, '').split('?')[0].trim();
      subtitle = digits;

      let countryCode = 'Local / Specified Format';
      if (digits.startsWith('+')) {
        const match = digits.match(/^\+([0-9]{1,3})/);
        if (match && match[1]) {
          countryCode = `+${match[1]} International Dial Code`;
        }
      }

      fields.push(
        { label: 'Telephone Number', value: digits, icon: 'phone' },
        { label: 'Dialing Code Pattern', value: countryCode, icon: 'info' }
      );

      actions.push(
        { id: 'call_phone', label: primaryLabel, icon: 'phone', type: primaryType, isPrimary: true },
        { id: 'copy_phone', label: 'Copy Telephone Number', icon: 'copy', type: 'COPY', isPrimary: false },
        { id: 'share_phone', label: 'Share Telephone Number', icon: 'share', type: 'SHARE', isPrimary: false },
        { id: 'favorite_phone', label: 'Favorite Number', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
      );
    }

    return {
      contentType,
      displayTitle: title,
      displaySubtitle: subtitle,
      rawValue: clean,
      fields,
      actions,
      metadata: {
        format: `${contentType} Communication Protocol`,
        errorCorrection: 'Level M Redundancy Verification',
        length: `${clean.length} Bytes`,
        timestamp: Date.now(),
        hardwareType,
      },
      icon,
      accentVariant,
    };
  }
}
