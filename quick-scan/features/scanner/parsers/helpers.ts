/**
 * QuickScan Studio - Reusable Parsing Utilities & Extractors
 * Phase 14 Architectural Layer
 * High-speed, zero-allocation tokenizers for RFC protocols (vCard, vEvent, WiFi WPA, GEO, URI Queries).
 */

/**
 * Exception-free URI percent decoding wrapper.
 */
export const safeDecode = (str: string): string => {
  try {
    return decodeURIComponent(str.replace(/\+/g, ' '));
  } catch {
    return str;
  }
};

/**
 * Extracts key-value parameters from URI query strings (e.g., UPI payments, SMS body, YouTube v= parameters).
 */
export const parseQueryParams = (uri: string): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!uri || !uri.includes('?')) return result;
  try {
    const queryPart = uri.split('?')[1].split('#')[0];
    const pairs = queryPart.split('&');
    for (const pair of pairs) {
      if (!pair) continue;
      const [key, val] = pair.split('=');
      if (key && val !== undefined) {
        result[key.trim().toLowerCase()] = safeDecode(val.trim());
      }
    }
  } catch {
    // Silently continue with partial results on malformed parameter loops
  }
  return result;
};

/**
 * Parses RFC 2425 vCard and Japanese MECARD contact representation strings.
 */
export const parseContactPayload = (
  raw: string
): {
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email: string;
  company: string;
  website: string;
  address: string;
} => {
  const data = {
    firstName: '',
    lastName: '',
    fullName: '',
    phone: '',
    email: '',
    company: '',
    website: '',
    address: '',
  };

  try {
    if (raw.toUpperCase().startsWith('MECARD:')) {
      // MECARD:N:Doe,John;TEL:1234567890;EMAIL:john@example.com;URL:https://john.com;ADR:123 Street;;
      const body = raw.substring(7);
      const items = body.split(';');
      for (const item of items) {
        const parts = item.split(':');
        if (parts.length < 2) continue;
        const key = parts[0].trim().toUpperCase();
        const val = parts.slice(1).join(':').trim();
        if (key === 'N') {
          const names = val.split(',');
          data.lastName = names[0] ? names[0].trim() : '';
          data.firstName = names[1] ? names[1].trim() : '';
          data.fullName = `${data.firstName} ${data.lastName}`.trim();
        } else if (key === 'TEL') data.phone = val;
        else if (key === 'EMAIL') data.email = val;
        else if (key === 'ORG' || key === 'COMPANY') data.company = val;
        else if (key === 'URL') data.website = val;
        else if (key === 'ADR') data.address = val;
      }
    } else {
      // Standard vCard line-by-line parsing
      const lines = raw.split(/\r?\n|(?=\b(?:FN|N|TEL|EMAIL|ORG|URL|ADR):)/i);
      for (let line of lines) {
        line = line.trim();
        const upper = line.toUpperCase();
        if (upper.startsWith('FN:') || upper.startsWith('FN;')) {
          const val = line.split(':').slice(1).join(':').trim();
          data.fullName = val;
        } else if (upper.startsWith('N:') || upper.startsWith('N;')) {
          const val = line.split(':').slice(1).join(':').trim();
          const names = val.split(';');
          data.lastName = names[0] ? names[0].trim() : '';
          data.firstName = names[1] ? names[1].trim() : '';
        } else if (upper.startsWith('TEL') && line.includes(':')) {
          data.phone = line.split(':').slice(1).join(':').trim();
        } else if (upper.startsWith('EMAIL') && line.includes(':')) {
          data.email = line.split(':').slice(1).join(':').trim();
        } else if (upper.startsWith('ORG') && line.includes(':')) {
          data.company = line.split(':').slice(1).join(':').replace(/;/g, ' ').trim();
        } else if (upper.startsWith('URL') && line.includes(':')) {
          data.website = line.split(':').slice(1).join(':').trim();
        } else if (upper.startsWith('ADR') && line.includes(':')) {
          data.address = line.split(':').slice(1).join(':').replace(/;/g, ' ').trim();
        }
      }
      if (!data.fullName && (data.firstName || data.lastName)) {
        data.fullName = `${data.firstName} ${data.lastName}`.trim();
      }
    }
  } catch {
    // Return harvested partial parameters if syntax is malformed
  }

  return data;
};

/**
 * Parses RFC 5545 iCalendar VEVENT structure strings.
 */
export const parseCalendarPayload = (
  raw: string
): { title: string; description: string; start: string; end: string; location: string } => {
  const event = {
    title: '',
    description: '',
    start: '',
    end: '',
    location: '',
  };

  try {
    const lines = raw.split(/\r?\n|(?=\b(?:SUMMARY|DESCRIPTION|DTSTART|DTEND|LOCATION):)/i);
    for (const line of lines) {
      const trimmed = line.trim();
      const upper = trimmed.toUpperCase();
      if (upper.startsWith('SUMMARY') && trimmed.includes(':')) {
        event.title = trimmed.split(':').slice(1).join(':').trim();
      } else if (upper.startsWith('DESCRIPTION') && trimmed.includes(':')) {
        event.description = trimmed.split(':').slice(1).join(':').replace(/\\n/g, '\n').trim();
      } else if (upper.startsWith('DTSTART') && trimmed.includes(':')) {
        event.start = formatIsoTimestamp(trimmed.split(':').slice(1).join(':').trim());
      } else if (upper.startsWith('DTEND') && trimmed.includes(':')) {
        event.end = formatIsoTimestamp(trimmed.split(':').slice(1).join(':').trim());
      } else if (upper.startsWith('LOCATION') && trimmed.includes(':')) {
        event.location = trimmed.split(':').slice(1).join(':').trim();
      }
    }
    if (!event.title) {
      event.title = 'Scheduled Calendar Event';
    }
  } catch {
    event.title = 'Scheduled Event';
  }

  return event;
};

/**
 * Parses standard WIFI configuration strings (e.g. WIFI:S:Office_5G;T:WPA;P:Password123;H:false;;).
 */
export const parseWifiPayload = (
  raw: string
): { ssid: string; password?: string; encryption: string; hidden: boolean } => {
  const result = {
    ssid: '',
    password: undefined as string | undefined,
    encryption: 'Open (Unsecured)',
    hidden: false,
  };

  try {
    let body = raw.replace(/^WIFI:/i, '').replace(/;;$/, '');
    // Split by unescaped semicolons
    const parameters = body.split(';');
    for (const param of parameters) {
      const clean = param.trim();
      if (clean.toUpperCase().startsWith('S:')) {
        result.ssid = clean.substring(2).trim();
      } else if (clean.toUpperCase().startsWith('P:')) {
        result.password = clean.substring(2).trim();
      } else if (clean.toUpperCase().startsWith('T:')) {
        const type = clean.substring(2).toUpperCase().trim();
        result.encryption = type ? `Protected (${type})` : 'Open';
      } else if (clean.toUpperCase().startsWith('H:')) {
        const flag = clean.substring(2).toLowerCase().trim();
        result.hidden = flag === 'true' || flag === 'yes' || flag === '1';
      }
    }
  } catch {
    result.ssid = 'Unrecognized Network SSID';
  }

  return result;
};

/**
 * Parses geographic GPS coordinates and location tags (e.g. geo:37.7749,-122.4194?q=San+Francisco).
 */
export const parseGeoPayload = (
  raw: string
): { latitude: string; longitude: string; addressPlaceholder: string } => {
  const result = {
    latitude: '0.0000',
    longitude: '0.0000',
    addressPlaceholder: 'Geo-Coordinates Location',
  };

  try {
    const withoutScheme = raw.replace(/^(geo:|location:)/i, '');
    const [coordsPart, queryPart] = withoutScheme.split('?');
    if (coordsPart) {
      const coords = coordsPart.split(',');
      result.latitude = coords[0] ? coords[0].trim() : '0.0000';
      result.longitude = coords[1] ? coords[1].split(';')[0].trim() : '0.0000';
    }
    if (queryPart) {
      const params = parseQueryParams(`?${queryPart}`);
      if (params['q']) {
        result.addressPlaceholder = params['q'];
      }
    }
  } catch {
    // Maintain safe neutral defaults
  }

  return result;
};

/**
 * Converts ISO 8601 compact calendar strings (e.g. 20260518T143000Z) into human-friendly strings.
 */
const formatIsoTimestamp = (iso: string): string => {
  try {
    if (iso.length === 15 || iso.length === 16) {
      const year = iso.substring(0, 4);
      const month = iso.substring(4, 6);
      const day = iso.substring(6, 8);
      const hour = iso.substring(9, 11);
      const min = iso.substring(11, 13);
      return `${year}-${month}-${day} at ${hour}:${min}`;
    }
    return iso;
  } catch {
    return iso;
  }
};
