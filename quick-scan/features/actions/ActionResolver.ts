/**
 * QuickScan Studio - Smart Action Resolver Engine
 * Phase 18: Dynamically filters and maps applicable smart actions based on detected content type and payload parameters
 */
import { ActionDefinition, ActionExecutionContext, ResolvedActionGroups } from './types';
import { ACTION_REGISTRY } from './ActionRegistry';

export class ActionResolver {
  public static resolve(context: ActionExecutionContext): ResolvedActionGroups {
    const primary: ActionDefinition[] = [];
    const quick: ActionDefinition[] = [];
    const secondary: ActionDefinition[] = [];

    const type = context.contentType.toUpperCase();
    const payload = context.rawValue;

    // 1. Resolve Primary Actions by specialized content type
    if (type === 'WEBSITE' || type === 'URL' || payload.startsWith('http://') || payload.startsWith('https://')) {
      if (payload.includes('play.google.com/store')) {
        primary.push(ACTION_REGISTRY.OPEN_PLAY_STORE);
      } else if (payload.includes('apps.apple.com') || payload.includes('itunes.apple.com')) {
        primary.push(ACTION_REGISTRY.OPEN_APP_STORE);
      } else if (payload.includes('youtube.com') || payload.includes('youtu.be')) {
        primary.push(ACTION_REGISTRY.OPEN_YOUTUBE);
      } else if (payload.includes('facebook.com') || payload.includes('fb.watch')) {
        primary.push(ACTION_REGISTRY.OPEN_FACEBOOK);
      } else if (payload.includes('instagram.com')) {
        primary.push(ACTION_REGISTRY.OPEN_INSTAGRAM);
      } else if (payload.includes('linkedin.com')) {
        primary.push(ACTION_REGISTRY.OPEN_LINKEDIN);
      } else {
        primary.push(ACTION_REGISTRY.OPEN_WEBSITE);
      }
    } else if (type === 'PHONE' || type === 'TEL' || payload.startsWith('tel:')) {
      primary.push(ACTION_REGISTRY.CALL_PHONE);
      primary.push(ACTION_REGISTRY.SEND_SMS);
    } else if (type === 'SMS' || payload.startsWith('sms:') || payload.startsWith('smsto:')) {
      primary.push(ACTION_REGISTRY.SEND_SMS);
      primary.push(ACTION_REGISTRY.CALL_PHONE);
    } else if (type === 'EMAIL' || type === 'MAILTO' || payload.startsWith('mailto:')) {
      primary.push(ACTION_REGISTRY.COMPOSE_EMAIL);
    } else if (type === 'WIFI' || payload.startsWith('WIFI:')) {
      primary.push(ACTION_REGISTRY.CONNECT_WIFI);
    } else if (type === 'UPI' || payload.startsWith('upi://')) {
      primary.push(ACTION_REGISTRY.OPEN_UPI_PAYMENT);
    } else if (type === 'WHATSAPP' || payload.startsWith('whatsapp:') || payload.includes('wa.me/')) {
      primary.push(ACTION_REGISTRY.OPEN_WHATSAPP);
    } else if (type === 'GEO' || type === 'LOCATION' || payload.startsWith('geo:')) {
      primary.push(ACTION_REGISTRY.OPEN_MAPS);
      primary.push(ACTION_REGISTRY.OPEN_GOOGLE_MAPS);
    } else if (type === 'VCARD' || type === 'MECARD' || type === 'CONTACT') {
      primary.push(ACTION_REGISTRY.CREATE_CONTACT);
    } else if (type === 'CALENDAR' || type === 'VEVENT' || type === 'EVENT') {
      primary.push(ACTION_REGISTRY.CREATE_CALENDAR);
    } else if (!context.isQR || type.includes('BARCODE') || type === 'EAN13' || type === 'UPC_A') {
      primary.push(ACTION_REGISTRY.OPEN_BARCODE_SEARCH);
    } else {
      // Fallback for Plain Text or unrecognized formats
      primary.push({
        ...ACTION_REGISTRY.COPY_TEXT,
        isPrimary: true,
        category: 'PRIMARY',
      });
    }

    // 2. Resolve Quick Action Grid items
    quick.push(ACTION_REGISTRY.COPY_TEXT);
    quick.push(ACTION_REGISTRY.SHARE_CONTENT);

    // Contextual copy shortcuts for complex data structures
    if (type === 'WIFI' || payload.startsWith('WIFI:')) {
      quick.push(ACTION_REGISTRY.COPY_WIFI_PASSWORD);
    } else if (type === 'UPI' || payload.startsWith('upi://')) {
      quick.push(ACTION_REGISTRY.COPY_UPI_ID);
    } else if (type === 'GEO' || payload.startsWith('geo:')) {
      quick.push(ACTION_REGISTRY.COPY_COORDINATES);
    }

    // Toggle Favorite Tile
    const favDef: ActionDefinition = {
      ...ACTION_REGISTRY.TOGGLE_FAVORITE,
      label: context.isFavorite ? 'Favorited' : 'Favorite',
      icon: context.isFavorite ? 'favoriteFilled' : 'favorite',
    };
    quick.push(favDef);

    // 3. Resolve Secondary Governance and Management commands
    secondary.push(ACTION_REGISTRY.GENERATE_QR_FROM_RESULT);
    if (context.scanId) {
      secondary.push(ACTION_REGISTRY.RENAME_HISTORY_ITEM);
      secondary.push(ACTION_REGISTRY.DELETE_HISTORY_ITEM);
    }
    secondary.push(ACTION_REGISTRY.CLEAR_HISTORY_ITEM);

    return {
      primary,
      quick,
      secondary,
    };
  }
}
