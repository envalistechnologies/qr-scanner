/**
 * QuickScan Studio - Generator Export & Storage Service
 * Phase 16 Architectural Layer (Bitmap PNG, Vector SVG, and Photo Library archiving)
 * Implements 100% offline local filesystem IO and media library saving.
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';

export interface ExportResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export class ExportService {
  private static instance: ExportService;

  private constructor() { }

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  /**
   * Extracts Base64 PNG bitmap data from react-native-qrcode-svg ref and writes to high-res filesystem file.
   */
  public async exportToPngFile(svgRef: any, fileName: string = `quickscan_qr_${Date.now()}`): Promise<ExportResult> {
    if (!svgRef || !svgRef.toDataURL) {
      return { success: false, error: 'Invalid QR Matrix Renderer reference' };
    }

    try {
      const base64Data: string = await new Promise((resolve, reject) => {
        try {
          svgRef.toDataURL((data: string) => {
            resolve(data);
          });
        } catch (e) {
          reject(e);
        }
      });

      const targetUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}${fileName}.png`;
      await FileSystem.writeAsStringAsync(targetUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return { success: true, uri: targetUri };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to encode and export PNG asset to file system' };
    }
  }

  /**
   * Extracts raw Scalable Vector Graphics XML string and writes an editable vector file.
   */
  public async exportToSvgFile(svgRef: any, fileName: string = `quickscan_qr_vector_${Date.now()}`): Promise<ExportResult> {
    if (!svgRef || !svgRef.toSVGString) {
      return { success: false, error: 'Vector SVG extraction not supported on this reference' };
    }

    try {
      const svgContent: string = await new Promise((resolve, reject) => {
        try {
          svgRef.toSVGString((data: string) => {
            resolve(data);
          });
        } catch (e) {
          reject(e);
        }
      });

      const targetUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory}${fileName}.svg`;
      await FileSystem.writeAsStringAsync(targetUri, svgContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      return { success: true, uri: targetUri };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to export SVG vector package' };
    }
  }

  /**
   * Commits a generated filesystem asset to the system device photo album under 'QuickScan' directory.
   */
  public async saveToDeviceGallery(fileUri: string): Promise<ExportResult> {
    try {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted && permission.status !== MediaLibrary.PermissionStatus.GRANTED) {
        return { success: false, error: 'Photo library authorization was denied. Enable permission in System Settings to archive QR codes.' };
      }

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      try {
        await MediaLibrary.createAlbumAsync('QuickScan Studio', asset, false);
      } catch {
        // Album might already exist or system folder rules apply; asset creation itself succeeded
      }

      return { success: true, uri: asset.uri || fileUri };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to save QR matrix to device gallery roll' };
    }
  }
}
