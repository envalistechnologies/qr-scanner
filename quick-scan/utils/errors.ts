/**
 * QuickScan Studio - Reusable Error Hierarchy
 * Phase 11 Architectural Layer
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly timestamp: number;

  constructor(message: string, code: string = 'ERR_GENERAL') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = Date.now();
  }
}

export class ScannerError extends AppError {
  constructor(message: string, code: string = 'ERR_SCANNER_FAIL') {
    super(message, code);
  }
}

export class PermissionError extends AppError {
  constructor(message: string, code: string = 'ERR_PERMISSION_DENIED') {
    super(message, code);
  }
}

export class StorageError extends AppError {
  constructor(message: string, code: string = 'ERR_STORAGE_FAULT') {
    super(message, code);
  }
}

export class GeneratorError extends AppError {
  constructor(message: string, code: string = 'ERR_GENERATION_INVALID') {
    super(message, code);
  }
}
