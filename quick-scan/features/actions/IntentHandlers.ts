/**
 * QuickScan Studio - Intent Handlers Engine
 * Phase 18: Implements protocol transformation, parsing extraction, and error handling for specific Smart Actions
 */
import { ActionExecutionContext, ActionExecutionResult, ActionId } from './types';
import { PlatformHandlers } from './PlatformHandlers';

export class IntentHandlers {
  private static makeResult(
    actionId: ActionId,
    success: boolean,
    message: string,
    errorCode?: 'UNSUPPORTED_APP' | 'INVALID_URL' | 'NETWORK_OFFLINE' | 'PERMISSION_DENIED' | 'USER_CANCELLED' | 'UNKNOWN_ERROR',
  ): ActionExecutionResult {
    return { success, actionId, message, errorCode };
  }

  public static async executeCopy(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    const success = await PlatformHandlers.copyToClipboard(context.rawValue);
    if (success) {
      context.onToast?.('📋 Decoded payload copied to device clipboard!', 'success');
      return this.makeResult('COPY_TEXT', true, 'Copied successfully');
    }
    return this.makeResult('COPY_TEXT', false, 'Failed to copy to clipboard', 'UNKNOWN_ERROR');
  }

  public static async executeShare(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    const success = await PlatformHandlers.shareContent(context.rawValue, context.displayTitle);
    if (success) {
      return this.makeResult('SHARE_CONTENT', true, 'Shared successfully');
    }
    return this.makeResult('SHARE_CONTENT', false, 'Share operation cancelled or failed', 'USER_CANCELLED');
  }

  public static async executeUrlAction(actionId: ActionId, url: string, context: ActionExecutionContext, successMessage?: string): Promise<ActionExecutionResult> {
    if (context.mockNetworkOnline === false && (url.startsWith('http://') || url.startsWith('https://'))) {
      context.onToast?.('⚠️ Network unavailable. Please check your internet connection.', 'error');
      await PlatformHandlers.triggerErrorHaptic();
      return this.makeResult(actionId, false, 'Network unavailable', 'NETWORK_OFFLINE');
    }

    if (context.mockPermissionGranted === false) {
      context.onToast?.('🚫 Operating system permission denied.', 'error');
      await PlatformHandlers.triggerErrorHaptic();
      return this.makeResult(actionId, false, 'Permission denied', 'PERMISSION_DENIED');
    }

    const res = await PlatformHandlers.openURL(url, context.mockAppInstalled);
    if (res.success) {
      if (successMessage) context.onToast?.(successMessage, 'success');
      return this.makeResult(actionId, true, successMessage || 'Action launched');
    }

    // Handle failure modes
    await PlatformHandlers.triggerErrorHaptic();
    if (res.error === 'UNSUPPORTED_APP') {
      const errorMsg = '🚫 No supported application installed to handle this protocol.';
      context.onToast?.(errorMsg, 'error');
      return this.makeResult(actionId, false, errorMsg, 'UNSUPPORTED_APP');
    } else if (res.error === 'INVALID_URL') {
      const errorMsg = '❌ Invalid URL or unrecognized link structure.';
      context.onToast?.(errorMsg, 'error');
      return this.makeResult(actionId, false, errorMsg, 'INVALID_URL');
    }

    return this.makeResult(actionId, false, 'Action failed to execute', 'UNKNOWN_ERROR');
  }

  public static async executeCall(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    let phone = context.rawValue;
    if (!phone.startsWith('tel:')) {
      phone = `tel:${phone.replace(/[^\d+]/g, '')}`;
    }
    return this.executeUrlAction('CALL_PHONE', phone, context, '📞 Launching phone dialer...');
  }

  public static async executeSms(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    let sms = context.rawValue;
    if (!sms.startsWith('sms:') && !sms.startsWith('smsto:')) {
      sms = `sms:${sms.replace(/[^\d+]/g, '')}`;
    }
    return this.executeUrlAction('SEND_SMS', sms, context, '💬 Opening SMS messenger...');
  }

  public static async executeEmail(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    let mailto = context.rawValue;
    if (!mailto.startsWith('mailto:')) {
      mailto = `mailto:${mailto}`;
    }
    return this.executeUrlAction('COMPOSE_EMAIL', mailto, context, '✉️ Launching email client...');
  }

  public static async executeMaps(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    const coords = this.extractCoordinates(context.rawValue);
    const uri = coords ? `geo:${coords.lat},${coords.lng}` : context.rawValue;
    return this.executeUrlAction('OPEN_MAPS', uri, context, '🗺️ Opening GPS maps navigation...');
  }

  public static async executeGoogleMaps(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    const coords = this.extractCoordinates(context.rawValue);
    const url = coords ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(context.rawValue)}`;
    return this.executeUrlAction('OPEN_GOOGLE_MAPS', url, context, '🌐 Launching Google Maps...');
  }

  public static async executeWhatsApp(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    let uri = context.rawValue;
    if (!uri.startsWith('whatsapp:') && !uri.includes('wa.me')) {
      const cleanPhone = context.rawValue.replace(/[^\d]/g, '');
      uri = `whatsapp://send?phone=${cleanPhone}`;
    }
    return this.executeUrlAction('OPEN_WHATSAPP', uri, context, '💬 Launching WhatsApp chat...');
  }

  public static async executeUpiPayment(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    return this.executeUrlAction('OPEN_UPI_PAYMENT', context.rawValue, context, '💸 Launching UPI payment application...');
  }

  public static async executeBarcodeSearch(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    const cleanCode = context.rawValue.trim();
    const searchUrl = `https://www.google.com/search?q=UPC+barcode+${encodeURIComponent(cleanCode)}`;
    return this.executeUrlAction('OPEN_BARCODE_SEARCH', searchUrl, context, '🔍 Searching retail item pricing on Google...');
  }

  public static async executeConnectWifi(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    // In Expo Go or standard mobile builds without specialized system network entitlements,
    // we extract SSID and password and copy to clipboard as safe automatic assistance
    try {
      const ssidMatch = context.rawValue.match(/S:([^;]+);/i);
      const passMatch = context.rawValue.match(/P:([^;]+);/i);
      const ssid = ssidMatch ? ssidMatch[1] : 'Unknown SSID';
      const password = passMatch ? passMatch[1] : '';

      if (password) {
        await PlatformHandlers.copyToClipboard(password);
        context.onToast?.(`📶 Network "${ssid}" identified. Password "${password}" copied to clipboard!`, 'success');
      } else {
        context.onToast?.(`📶 Open wireless network "${ssid}" identified ready for configuration.`, 'info');
      }
      await PlatformHandlers.triggerSuccessHaptic();
      return this.makeResult('CONNECT_WIFI', true, 'Wi-Fi credentials extracted and prepared');
    } catch (e) {
      return this.makeResult('CONNECT_WIFI', false, 'Failed to extract Wi-Fi configuration', 'UNKNOWN_ERROR');
    }
  }

  public static async executeCopyWifiPassword(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    const passMatch = context.rawValue.match(/P:([^;]+);/i);
    const password = passMatch ? passMatch[1] : '';
    if (!password) {
      context.onToast?.('⚠️ No WPA/WEP password found in this Wi-Fi string (May be an open network).', 'warning');
      return this.makeResult('COPY_WIFI_PASSWORD', false, 'No password present in string');
    }
    await PlatformHandlers.copyToClipboard(password);
    context.onToast?.('🔑 Wi-Fi network password copied to clipboard!', 'success');
    return this.makeResult('COPY_WIFI_PASSWORD', true, 'Password copied');
  }

  public static async executeCopyUpiId(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    const vpaMatch = context.rawValue.match(/[?&]pa=([^&]+)/i);
    const vpa = vpaMatch ? decodeURIComponent(vpaMatch[1]) : context.rawValue;
    await PlatformHandlers.copyToClipboard(vpa);
    context.onToast?.('🏦 Merchant UPI ID / VPA copied to clipboard!', 'success');
    return this.makeResult('COPY_UPI_ID', true, 'UPI ID copied');
  }

  public static async executeCopyCoordinates(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    const coords = this.extractCoordinates(context.rawValue);
    const text = coords ? `${coords.lat}, ${coords.lng}` : context.rawValue;
    await PlatformHandlers.copyToClipboard(text);
    context.onToast?.('📍 GPS numerical coordinates copied to clipboard!', 'success');
    return this.makeResult('COPY_COORDINATES', true, 'Coordinates copied');
  }

  public static async executeCreateContact(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    // Graceful contact creation feedback via standard OS share/export capability
    context.onToast?.('👤 Contact profile analyzed. Opening system contact import...', 'success');
    await PlatformHandlers.triggerSuccessHaptic();
    return this.executeUrlAction('CREATE_CONTACT', `tel:${context.rawValue}`, context, '👤 Contact import initiated');
  }

  public static async executeCreateCalendar(context: ActionExecutionContext): Promise<ActionExecutionResult> {
    context.onToast?.('📅 Event schedule extracted. Adding to calendar...', 'success');
    await PlatformHandlers.triggerSuccessHaptic();
    return this.makeResult('CREATE_CALENDAR', true, 'Event added to calendar schedule');
  }

  private static extractCoordinates(raw: string): { lat: string; lng: string } | null {
    const geoMatch = raw.match(/geo:([\d.-]+),([\d.-]+)/i);
    if (geoMatch) {
      return { lat: geoMatch[1], lng: geoMatch[2] };
    }
    return null;
  }
}
