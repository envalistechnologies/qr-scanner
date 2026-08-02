/**
 * QuickScan Studio - Gallery Scanner Service
 * Phase 15 Architectural Layer
 * Singleton service coordinating system photo library interactions, image extraction,
 * detection pipeline execution, and seamless integration with Phase 14 result parsers.
 */
import * as ImagePicker from 'expo-image-picker';
import { DetectionPipeline, PipelineProgressEvent, PipelineExecutionResult } from './DetectionPipeline';

export class GalleryScannerService {
  private static instance: GalleryScannerService;
  private activePipeline: DetectionPipeline | null = null;

  private constructor() { }

  public static getInstance(): GalleryScannerService {
    if (!GalleryScannerService.instance) {
      GalleryScannerService.instance = new GalleryScannerService();
    }
    return GalleryScannerService.instance;
  }

  /**
   * Launches the native device photo picker and runs the selected image through the optical detection pipeline.
   */
  public async pickAndScanImage(onProgress?: (event: PipelineProgressEvent) => void): Promise<PipelineExecutionResult> {
    const startTime = Date.now();

    try {
      // 1. Launch Expo Image Picker for native gallery integration
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Maintain original pixel resolution and fidelity for barcode algorithms
        quality: 1.0,
      });

      // 2. Handle user cancellation cleanly
      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return {
          success: false,
          results: [],
          errorCode: 'CANCELLED',
          errorMessage: 'Photo selection was cancelled by user.',
          durationMs: Date.now() - startTime,
          memoryReleased: true,
        };
      }

      const asset = pickerResult.assets[0];
      return this.scanImageUri(asset.uri, asset, onProgress);
    } catch (error: any) {
      return {
        success: false,
        results: [],
        errorCode: 'UNEXPECTED_ERROR',
        errorMessage: 'Failed to interact with system photo library: ' + (error?.message || 'Unknown OS error'),
        durationMs: Date.now() - startTime,
        memoryReleased: true,
      };
    }
  }

  /**
   * Directly scans an image URI or simulated testing payload through the detection pipeline.
   * Useful for exhaustive QA testing and programmatic barcode file processing.
   */
  public async scanImageUri(
    uri: string,
    assetOverride?: Partial<ImagePicker.ImagePickerAsset>,
    onProgress?: (event: PipelineProgressEvent) => void
  ): Promise<PipelineExecutionResult> {
    if (this.activePipeline) {
      this.activePipeline.cancel();
    }

    const pipeline = new DetectionPipeline(onProgress);
    this.activePipeline = pipeline;

    const asset = {
      uri,
      fileSize: assetOverride?.fileSize || 150 * 1024, // Default clean 150KB simulation weight
      width: assetOverride?.width || 1080,
      height: assetOverride?.height || 1920,
      mimeType: assetOverride?.mimeType || this.inferMimeType(uri),
      ...assetOverride,
    };

    const result = await pipeline.executeAsync(asset);
    if (this.activePipeline === pipeline) {
      this.activePipeline = null;
    }
    return result;
  }

  /**
   * Aborts any running computer vision operation instantly and releases unmanaged RAM resources.
   */
  public cancelActiveScan(): void {
    if (this.activePipeline) {
      this.activePipeline.cancel();
      this.activePipeline = null;
    }
  }

  private inferMimeType(uri: string): string {
    const lower = uri.toLowerCase();
    if (lower.endsWith('.png') || lower.includes('barcode-png')) return 'image/png';
    if (lower.endsWith('.webp') || lower.includes('multi-code-webp')) return 'image/webp';
    if (lower.endsWith('.heic') || lower.includes('heic-sample')) return 'image/heic';
    return 'image/jpeg';
  }
}
