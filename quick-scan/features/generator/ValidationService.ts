/**
 * QuickScan Studio - Generator Validation Service
 * Phase 16 Architectural Layer (Inline field validation & error shielding)
 * Prevents invalid QR matrix creation without external API dependencies.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class ValidationService {
  private static instance: ValidationService;

  private constructor() { }

  public static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  /**
   * Evaluates input key-values for a given QR type and returns inline validation errors.
   */
  public validate(typeId: string, data: Record<string, string>): ValidationResult {
    const errors: Record<string, string> = {};

    switch (typeId) {
      case 'web':
      case 'facebook':
      case 'linkedin':
      case 'youtube': {
        const url = data.url || '';
        if (!url || !url.trim()) {
          errors.url = 'URL destination cannot be empty';
        } else if (!this.isValidUrl(url.trim())) {
          errors.url = 'Please enter a valid HTTP or HTTPS Web Domain URL (e.g. https://domain.com)';
        }
        break;
      }

      case 'email': {
        const email = data.email || '';
        if (!email || !email.trim()) {
          errors.email = 'Recipient email address cannot be empty';
        } else if (!this.isValidEmail(email.trim())) {
          errors.email = 'Please enter a valid email syntax (e.g. name@domain.com)';
        }
        break;
      }

      case 'phone':
      case 'sms':
      case 'whatsapp': {
        const phone = data.phone || '';
        if (!phone || !phone.trim()) {
          errors.phone = 'Phone number cannot be empty';
        } else if (!this.isValidPhone(phone.trim())) {
          errors.phone = 'Please enter a valid phone number (min 5 digits, include country code +91/+1)';
        }
        break;
      }

      case 'wifi': {
        const ssid = data.ssid || '';
        if (!ssid || !ssid.trim()) {
          errors.ssid = 'Network SSID (Wi-Fi Name) cannot be empty';
        }
        break;
      }

      case 'contact': {
        const name = data.name || '';
        const phone = data.phone || '';
        const email = data.email || '';
        if (!name.trim() && !phone.trim() && !email.trim()) {
          errors.name = 'At least Full Name, Mobile Phone, or Email is required for vCard';
        }
        if (email.trim() && !this.isValidEmail(email.trim())) {
          errors.email = 'Please enter a valid email syntax';
        }
        if (phone.trim() && !this.isValidPhone(phone.trim())) {
          errors.phone = 'Please enter a valid phone number';
        }
        break;
      }

      case 'location': {
        const lat = parseFloat(data.lat || '');
        const lng = parseFloat(data.lng || '');
        if (isNaN(lat) || lat < -90 || lat > 90) {
          errors.lat = 'Latitude must be between -90 and 90';
        }
        if (isNaN(lng) || lng < -180 || lng > 180) {
          errors.lng = 'Longitude must be between -180 and 180';
        }
        break;
      }

      case 'calendar': {
        const title = data.title || '';
        if (!title || !title.trim()) {
          errors.title = 'Event title cannot be empty';
        }
        break;
      }

      case 'instagram': {
        const handle = data.handle || '';
        if (!handle || !handle.trim()) {
          errors.handle = 'Instagram profile handle or URL cannot be empty';
        }
        break;
      }

      case 'playstore':
      case 'appstore': {
        const appId = data.appId || '';
        if (!appId || !appId.trim()) {
          errors.appId = 'Store Package Name or App Link URL cannot be empty';
        }
        break;
      }

      case 'upi': {
        const vpa = data.vpa || '';
        if (!vpa || !vpa.trim()) {
          errors.vpa = 'UPI Virtual Payment Address (VPA) cannot be empty';
        } else if (!vpa.includes('@')) {
          errors.vpa = 'Invalid VPA format. Must contain @ (e.g. merchant@upi, name@okaxis)';
        }
        break;
      }

      case 'bitcoin': {
        const address = data.address || '';
        if (!address || !address.trim()) {
          errors.address = 'Bitcoin public receiving address cannot be empty';
        } else if (address.trim().length < 26) {
          errors.address = 'Invalid Bitcoin wallet address length (typically 26-62 alphanumeric characters)';
        }
        break;
      }

      case 'text':
      case 'custom':
      default: {
        const payload = data.payload || data.text || '';
        if (!payload || !payload.trim()) {
          errors.payload = 'Text payload content cannot be completely empty';
        } else if (payload.length > 4296) {
          errors.payload = 'Exceeded standard QR capacity maximum (4,296 alphanumeric characters)';
        }
        break;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private isValidUrl(url: string): boolean {
    // Tolerant check for HTTP, HTTPS, or domain dot notation without network requests
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?.*)?$/i;
    return urlPattern.test(url) || url.startsWith('http://') || url.startsWith('https://');
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return emailPattern.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const cleanDigits = phone.replace(/[^0-9]/g, '');
    return cleanDigits.length >= 5 && cleanDigits.length <= 16;
  }
}
