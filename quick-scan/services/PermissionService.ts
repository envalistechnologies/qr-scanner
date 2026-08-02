/**
 * QuickScan Studio - Permission Service
 * Phase 15 Architectural Layer (System Media Library and Camera permission bridging)
 */
import * as ImagePicker from 'expo-image-picker';
import { PermissionStatus } from '../types/domain';

export class PermissionService {
  private static instance: PermissionService;

  private constructor() { }

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  public async checkCameraPermission(): Promise<PermissionStatus> {
    // Stub implementation returning simulated granted state
    return 'granted';
  }

  public async requestCameraPermission(): Promise<PermissionStatus> {
    // Stub implementation without native OS calls
    return 'granted';
  }

  /**
   * Evaluates current system photo library authorization status without displaying operating system prompts.
   */
  public async checkGalleryPermission(): Promise<PermissionStatus> {
    try {
      const status = await ImagePicker.getMediaLibraryPermissionsAsync();
      return this.mapExpoPermissionToDomain(status);
    } catch {
      return 'granted'; // Safe default fallback on unsupported web/simulator environments
    }
  }

  /**
   * Requests device photo roll access from user via OS permission dialog after explanation screen review.
   */
  public async requestGalleryPermission(): Promise<PermissionStatus> {
    try {
      const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return this.mapExpoPermissionToDomain(status);
    } catch {
      return 'granted';
    }
  }

  private mapExpoPermissionToDomain(res: ImagePicker.MediaLibraryPermissionResponse): PermissionStatus {
    if (res.granted || res.status === ImagePicker.PermissionStatus.GRANTED) {
      return 'granted';
    }
    if (res.status === ImagePicker.PermissionStatus.DENIED) {
      return 'denied';
    }
    if (res.status === ImagePicker.PermissionStatus.UNDETERMINED) {
      return 'not_determined';
    }
    return 'restricted';
  }
}
