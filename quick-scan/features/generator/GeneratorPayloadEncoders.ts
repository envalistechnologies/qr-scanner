/**
 * QuickScan Studio - Generator Payload Encoders
 * Phase 16 Architectural Layer
 * Translates structured form parameters into standardized RFC / URI QR payloads for all 19 supported types.
 */

export class GeneratorPayloadEncoders {
  public static encode(typeId: string, data: Record<string, string>): string {
    switch (typeId) {
      case 'web': {
        const url = data.url || 'https://quickscan.app/studio';
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return `https://${url}`;
        }
        return url;
      }

      case 'text':
      case 'custom': {
        return data.payload || data.text || 'QuickScan Studio Plaintext Matrix';
      }

      case 'email': {
        const email = data.email || '';
        const subject = data.subject ? `subject=${encodeURIComponent(data.subject)}` : '';
        const body = data.body ? `body=${encodeURIComponent(data.body)}` : '';
        const params = [subject, body].filter(Boolean).join('&');
        return `mailto:${email}${params ? `?${params}` : ''}`;
      }

      case 'phone': {
        const phone = data.phone || '';
        return `tel:${phone.replace(/\s+/g, '')}`;
      }

      case 'sms': {
        const phone = (data.phone || '').replace(/\s+/g, '');
        const body = data.body ? `?body=${encodeURIComponent(data.body)}` : '';
        return `sms:${phone}${body}`;
      }

      case 'wifi': {
        const ssid = data.ssid || 'Guest_Network';
        const password = data.password || '';
        const encRaw = data.encryption || 'WPA/WPA2-PSK';
        let type = 'WPA';
        if (encRaw.includes('WEP')) type = 'WEP';
        else if (encRaw.includes('None') || encRaw.includes('Open')) type = 'nopass';

        return `WIFI:S:${this.escapeWifiString(ssid)};T:${type};${type !== 'nopass' ? `P:${this.escapeWifiString(password)};` : ''}H:false;;`;
      }

      case 'contact': {
        const name = data.name || 'Envalis Technologies Contact';
        const phone = data.phone || '';
        const email = data.email || '';
        const org = data.org || 'Envalis Technologies';
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${name}`,
          phone ? `TEL;TYPE=CELL:${phone}` : '',
          email ? `EMAIL;TYPE=INTERNET:${email}` : '',
          org ? `ORG:${org}` : '',
          'END:VCARD',
        ]
          .filter(Boolean)
          .join('\r\n');
      }

      case 'location': {
        const lat = data.lat || '0.0';
        const lng = data.lng || '0.0';
        const label = data.label ? `?q=${encodeURIComponent(data.label)}` : '';
        return `geo:${lat},${lng}${label}`;
      }

      case 'calendar': {
        const title = data.title || 'Meeting Event';
        const location = data.location || '';
        const description = data.description || '';
        const dtstart = (data.date || '2026-08-25').replace(/[-:]/g, '') + 'T140000Z';
        const dtend = (data.date || '2026-08-25').replace(/[-:]/g, '') + 'T150000Z';
        return [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'BEGIN:VEVENT',
          `SUMMARY:${title}`,
          location ? `LOCATION:${location}` : '',
          description ? `DESCRIPTION:${description}` : '',
          `DTSTART:${dtstart}`,
          `DTEND:${dtend}`,
          'END:VEVENT',
          'END:VCALENDAR',
        ]
          .filter(Boolean)
          .join('\r\n');
      }

      case 'whatsapp': {
        const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '');
        const greeting = data.body ? `?text=${encodeURIComponent(data.body)}` : '';
        return `https://wa.me/${cleanPhone}${greeting}`;
      }

      case 'instagram': {
        const handle = (data.handle || 'envalis.technologies').replace(/^@/, '');
        if (handle.startsWith('http')) return handle;
        return `https://instagram.com/${handle}`;
      }

      case 'facebook': {
        return data.url || 'https://facebook.com/envalis.technologies';
      }

      case 'linkedin': {
        return data.url || 'https://linkedin.com/company/envalis-technologies';
      }

      case 'youtube': {
        return data.url || 'https://youtube.com/@EnvalisTechnologies/videos';
      }

      case 'playstore': {
        const appId = data.appId || 'com.envalistechnologies.quickscan';
        if (appId.startsWith('http') || appId.startsWith('market://')) return appId;
        return `https://play.google.com/store/apps/details?id=${appId}`;
      }

      case 'appstore': {
        const appId = data.appId || '1234567890';
        if (appId.startsWith('http') || appId.startsWith('itms')) return appId;
        return `https://apps.apple.com/app/id${appId.replace(/^id/i, '')}`;
      }

      case 'upi': {
        const vpa = data.vpa || 'envalistechnologies@okaxis';
        const name = data.name || 'Envalis Technologies';
        const amount = data.amount ? `&am=${data.amount}` : '';
        const note = data.note ? `&tn=${encodeURIComponent(data.note)}` : '';
        return `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}&cu=INR${amount}${note}`;
      }

      case 'bitcoin': {
        const address = data.address || 'bc1qenvalistechnologiesqrstudiobtc';
        const amount = data.amount ? `?amount=${data.amount}` : '';
        const label = data.label ? `${amount ? '&' : '?'}label=${encodeURIComponent(data.label)}` : '';
        return `bitcoin:${address}${amount}${label}`;
      }

      default:
        return data.payload || data.text || data.url || 'QuickScan Default Matrix';
    }
  }

  private static escapeWifiString(str: string): string {
    return str.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/:/g, '\\:');
  }
}
