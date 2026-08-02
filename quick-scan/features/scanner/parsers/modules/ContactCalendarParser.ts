/**
 * QuickScan Studio - Contact, Calendar & Geographic Location Parser Module
 * Phase 14 Architectural Layer
 * High-speed tokenization and field extraction for vCard/MECARD business cards, iCalendar scheduling events, and geographic coordinate matrices.
 */
import { IScanParser, ScanContentType, StandardScanResult, ParsedField, MappedAction } from '../types';
import { parseContactPayload, parseCalendarPayload, parseGeoPayload } from '../helpers';
import { IconName, icons } from '../../../../theme/icons';

export class ContactCalendarParser implements IScanParser {
  public type: ScanContentType[] = ['VCARD', 'CALENDAR', 'GEO'];

  public canParse(raw: string): boolean {
    if (!raw || typeof raw !== 'string') return false;
    const upper = raw.trim().toUpperCase();
    return (
      upper.startsWith('BEGIN:VCARD') ||
      upper.startsWith('MECARD:') ||
      upper.startsWith('BEGIN:VEVENT') ||
      upper.startsWith('BEGIN:VCALENDAR') ||
      upper.startsWith('GEO:') ||
      upper.startsWith('LOCATION:')
    );
  }

  public parse(raw: string, hardwareType: string = 'qr'): StandardScanResult {
    const clean = raw.trim();
    const upper = clean.toUpperCase();

    let contentType: ScanContentType = 'VCARD';
    let title = 'Contact Information Card';
    let subtitle = 'Personal Address Book Entry';
    let icon: IconName | keyof typeof icons = 'contact';
    let accentVariant: 'primary' | 'success' | 'warning' | 'info' | 'error' = 'primary';
    const fields: ParsedField[] = [];
    const actions: MappedAction[] = [];
    let primaryLabel = 'Save to Contacts';

    if (upper.startsWith('BEGIN:VCARD') || upper.startsWith('MECARD:')) {
      contentType = 'VCARD';
      title = 'Personal Contact Card (vCard)';
      icon = 'contact';
      accentVariant = 'primary';
      primaryLabel = 'Add to Device Contacts';

      const data = parseContactPayload(clean);
      subtitle = data.fullName || data.company || 'New Address Book Entry';

      if (data.fullName) fields.push({ label: 'Full Name', value: data.fullName, icon: 'user' });
      if (data.firstName) fields.push({ label: 'First Name', value: data.firstName, icon: 'user' });
      if (data.lastName) fields.push({ label: 'Last Name', value: data.lastName, icon: 'user' });
      if (data.phone) fields.push({ label: 'Telephone Number', value: data.phone, icon: 'phone' });
      if (data.email) fields.push({ label: 'Email Address', value: data.email, icon: 'email' });
      if (data.company) fields.push({ label: 'Organization / Company', value: data.company, icon: 'info' });
      if (data.website) fields.push({ label: 'Website URL', value: data.website, icon: 'url' });
      if (data.address) fields.push({ label: 'Mailing Address', value: data.address, icon: 'location' });

      actions.push(
        { id: 'save_contact', label: primaryLabel, icon: 'user', type: 'OPEN', isPrimary: true },
        { id: 'copy_phone', label: data.phone ? 'Copy Phone Number' : 'Copy Contact Data', icon: 'copy', type: 'COPY', isPrimary: false },
        { id: 'share_vcard', label: 'Share vCard Card', icon: 'share', type: 'SHARE', isPrimary: false },
        { id: 'favorite_contact', label: 'Favorite Contact', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
      );
    } else if (upper.startsWith('BEGIN:VEVENT') || upper.startsWith('BEGIN:VCALENDAR')) {
      contentType = 'CALENDAR';
      title = 'Scheduled Calendar Event';
      icon = 'calendar';
      accentVariant = 'info';
      primaryLabel = 'Add to Device Calendar';

      const event = parseCalendarPayload(clean);
      subtitle = event.title || 'Upcoming Appointment Schedule';

      fields.push({ label: 'Event Summary / Title', value: event.title, icon: 'calendar' });
      if (event.start) fields.push({ label: 'Start Timestamp', value: event.start, icon: 'clock' });
      if (event.end) fields.push({ label: 'End Timestamp', value: event.end, icon: 'clock' });
      if (event.location) fields.push({ label: 'Event Location', value: event.location, icon: 'location' });
      if (event.description) fields.push({ label: 'Event Description / Notes', value: event.description, icon: 'text' });

      actions.push(
        { id: 'save_event', label: primaryLabel, icon: 'calendar', type: 'OPEN', isPrimary: true },
        { id: 'copy_event_details', label: 'Copy Event Summary', icon: 'copy', type: 'COPY', isPrimary: false },
        { id: 'share_calendar_invite', label: 'Share Event Invite', icon: 'share', type: 'SHARE', isPrimary: false },
        { id: 'favorite_event', label: 'Favorite Event', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
      );
    } else {
      // GEO parsing
      contentType = 'GEO';
      title = 'Geographic Map Coordinates';
      icon = 'location';
      accentVariant = 'warning';
      primaryLabel = 'Open in Navigation Maps';

      const geo = parseGeoPayload(clean);
      subtitle = geo.addressPlaceholder || `Lat: ${geo.latitude}, Lng: ${geo.longitude}`;

      fields.push(
        { label: 'Latitude Coordinate', value: geo.latitude, icon: 'location' },
        { label: 'Longitude Coordinate', value: geo.longitude, icon: 'location' },
        { label: 'Address Placeholder / Query', value: geo.addressPlaceholder, icon: 'info' }
      );

      actions.push(
        { id: 'open_geo_maps', label: primaryLabel, icon: 'externalLink', type: 'MAP', isPrimary: true },
        { id: 'copy_coordinates', label: 'Copy GPS Coordinates', icon: 'copy', type: 'COPY', isPrimary: false },
        { id: 'share_location', label: 'Share Pin Location', icon: 'share', type: 'SHARE', isPrimary: false },
        { id: 'favorite_pin', label: 'Favorite Location', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
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
        format: `${contentType} Structured Schema`,
        errorCorrection: 'Level M Structural Integrity',
        length: `${clean.length} Bytes`,
        timestamp: Date.now(),
        hardwareType,
      },
      icon,
      accentVariant,
    };
  }
}
