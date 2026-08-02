/**
 * QuickScan Studio - Social Media & Deep Link Parser Module
 * Phase 14 Architectural Layer
 * Specialized detection and parameter extraction for 8 prominent deep-link ecosystems:
 * WhatsApp, Instagram, Facebook, LinkedIn, YouTube, Google Maps, Apple App Store, and Google Play Store.
 */
import { IScanParser, ScanContentType, StandardScanResult, ParsedField, MappedAction } from '../types';
import { safeExtractDomain } from '../validators';
import { parseQueryParams, safeDecode } from '../helpers';
import { IconName, icons } from '../../../../theme/icons';

export class SocialDeepLinkParser implements IScanParser {
  public type: ScanContentType[] = [
    'WHATSAPP',
    'INSTAGRAM',
    'FACEBOOK',
    'LINKEDIN',
    'YOUTUBE',
    'GOOGLE_MAPS',
    'APP_STORE',
    'PLAY_STORE',
  ];

  public canParse(raw: string): boolean {
    if (!raw || typeof raw !== 'string') return false;
    const lower = raw.trim().toLowerCase();
    return (
      lower.startsWith('whatsapp:') ||
      lower.includes('wa.me/') ||
      lower.includes('api.whatsapp.com') ||
      lower.includes('instagram.com') ||
      lower.includes('instagr.am') ||
      lower.startsWith('instagram:') ||
      lower.includes('facebook.com') ||
      lower.includes('fb.com') ||
      lower.includes('linkedin.com') ||
      lower.includes('youtube.com') ||
      lower.includes('youtu.be') ||
      lower.includes('maps.google.') ||
      lower.includes('goo.gl/maps') ||
      lower.includes('maps.app.goo.gl') ||
      lower.includes('apps.apple.com') ||
      lower.includes('play.google.com/store/apps')
    );
  }

  public parse(raw: string, hardwareType: string = 'qr'): StandardScanResult {
    const clean = raw.trim();
    const lower = clean.toLowerCase();

    let contentType: ScanContentType = 'WEBSITE';
    let title = 'Deep Link Resource';
    let subtitle = 'Social Media / Platform Schema';
    let icon: IconName | keyof typeof icons = 'externalLink';
    let accentVariant: 'primary' | 'success' | 'warning' | 'info' | 'error' = 'primary';
    const fields: ParsedField[] = [];
    const actions: MappedAction[] = [];
    let primaryLabel = 'Open Link';

    if (lower.startsWith('whatsapp:') || lower.includes('wa.me/') || lower.includes('api.whatsapp.com')) {
      contentType = 'WHATSAPP';
      title = 'WhatsApp Direct Chat';
      subtitle = 'Encrypted Messaging Platform';
      icon = 'whatsapp';
      accentVariant = 'success';
      primaryLabel = 'Open WhatsApp Chat';

      // Extract phone and pre-filled message
      let phone = '';
      if (lower.includes('wa.me/')) {
        phone = clean.split('wa.me/')[1].split('?')[0].replace(/[^0-9+]/g, '');
      } else if (lower.includes('phone=')) {
        const params = parseQueryParams(clean);
        phone = params['phone'] || '';
      } else if (lower.startsWith('whatsapp://send')) {
        const params = parseQueryParams(clean);
        phone = params['phone'] || '';
      }

      const params = parseQueryParams(clean);
      const text = params['text'] || params['body'] || '';

      if (phone) fields.push({ label: 'Recipient Number', value: phone, icon: 'phone' });
      if (text) fields.push({ label: 'Pre-filled Message', value: text, icon: 'sms' });
      fields.push({ label: 'Platform URI', value: clean, icon: 'whatsapp' });
    } else if (lower.includes('instagram.com') || lower.includes('instagr.am') || lower.startsWith('instagram:')) {
      contentType = 'INSTAGRAM';
      title = 'Instagram Profile / Media';
      subtitle = 'Social Media Handle';
      icon = 'instagram';
      accentVariant = 'info';
      primaryLabel = 'Open on Instagram';

      let handle = '';
      if (lower.includes('instagram.com/')) {
        handle = clean.split('instagram.com/')[1].split('/')[0].split('?')[0];
      } else if (lower.includes('instagr.am/')) {
        handle = clean.split('instagr.am/')[1].split('/')[0].split('?')[0];
      }
      if (handle) fields.push({ label: 'Account Handle', value: `@${handle}`, icon: 'user' });
      fields.push({ label: 'Direct Profile Link', value: clean, icon: 'instagram' });
    } else if (lower.includes('facebook.com') || lower.includes('fb.com')) {
      contentType = 'FACEBOOK';
      title = 'Facebook Page / Profile';
      subtitle = 'Meta Social Platform';
      icon = 'facebook';
      accentVariant = 'primary';
      primaryLabel = 'Open on Facebook';
      fields.push({ label: 'Platform Resource', value: clean, icon: 'facebook' });
    } else if (lower.includes('linkedin.com')) {
      contentType = 'LINKEDIN';
      title = 'LinkedIn Professional Profile';
      subtitle = 'Enterprise Network';
      icon = 'linkedin';
      accentVariant = 'primary';
      primaryLabel = 'Open on LinkedIn';
      fields.push({ label: 'Profile Identifier', value: clean, icon: 'linkedin' });
    } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      contentType = 'YOUTUBE';
      title = 'YouTube Video / Channel';
      subtitle = 'Video Streaming Media';
      icon = 'youtube';
      accentVariant = 'error'; // Red theme matching YouTube brand color token
      primaryLabel = 'Watch YouTube Video';

      let videoId = '';
      if (lower.includes('v=')) {
        const params = parseQueryParams(clean);
        videoId = params['v'] || '';
      } else if (lower.includes('youtu.be/')) {
        videoId = clean.split('youtu.be/')[1].split('?')[0];
      }
      if (videoId) fields.push({ label: 'Video Identifier (ID)', value: videoId, icon: 'youtube' });
      fields.push({ label: 'Media Stream URL', value: clean, icon: 'url' });
    } else if (lower.includes('maps.google.') || lower.includes('goo.gl/maps') || lower.includes('maps.app.goo.gl')) {
      contentType = 'GOOGLE_MAPS';
      title = 'Google Maps Location Pin';
      subtitle = 'Interactive Geographic Navigation';
      icon = 'location';
      accentVariant = 'warning';
      primaryLabel = 'Launch Google Maps';

      const params = parseQueryParams(clean);
      if (params['q'] || params['query']) {
        fields.push({ label: 'Target Location', value: params['q'] || params['query'] || '', icon: 'location' });
      }
      fields.push({ label: 'Map Pin URL', value: clean, icon: 'url' });
    } else if (lower.includes('apps.apple.com')) {
      contentType = 'APP_STORE';
      title = 'Apple App Store Product';
      subtitle = 'iOS Application Listing';
      icon = 'externalLink';
      accentVariant = 'primary';
      primaryLabel = 'View on Apple App Store';

      let appId = '';
      const match = clean.match(/id[0-9]{8,12}/i);
      if (match) appId = match[0];
      if (appId) fields.push({ label: 'Apple Store App ID', value: appId, icon: 'tag' });
      fields.push({ label: 'Store URL', value: clean, icon: 'url' });
    } else if (lower.includes('play.google.com/store/apps')) {
      contentType = 'PLAY_STORE';
      title = 'Google Play Store App';
      subtitle = 'Android Application Listing';
      icon = 'externalLink';
      accentVariant = 'success';
      primaryLabel = 'View on Google Play Store';

      const params = parseQueryParams(clean);
      const pkg = params['id'] || '';
      if (pkg) fields.push({ label: 'Android Package Name', value: pkg, icon: 'tag' });
      fields.push({ label: 'Store Listing URL', value: clean, icon: 'url' });
    }

    // Map standardized available actions without executing them (Execution scheduled for Phase 15)
    actions.push(
      { id: `open_${contentType.toLowerCase()}`, label: primaryLabel, icon: 'externalLink', type: 'OPEN', isPrimary: true },
      { id: 'copy_link', label: 'Copy Link URI', icon: 'copy', type: 'COPY', isPrimary: false },
      { id: 'share_link', label: 'Share Resource', icon: 'share', type: 'SHARE', isPrimary: false },
      { id: 'favorite_item', label: 'Favorite', icon: 'favorite', type: 'FAVORITE', isPrimary: false }
    );

    return {
      contentType,
      displayTitle: title,
      displaySubtitle: subtitle,
      rawValue: clean,
      fields,
      actions,
      metadata: {
        format: 'Deep Link Matrix',
        errorCorrection: 'Level H Redundancy Check',
        length: `${clean.length} Bytes`,
        timestamp: Date.now(),
        hardwareType,
        domain: safeExtractDomain(clean),
      },
      icon,
      accentVariant,
    };
  }
}
