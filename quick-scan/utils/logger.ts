/**
 * QuickScan Enterprise Studio - Centralized Production Telemetry & Diagnostics Logger
 * Phase 21: Prevents memory accumulation and I/O drag from verbose development logging in production releases
 */

const IS_DEV = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

class ProductionLogger {
  private currentLevel: LogLevel = IS_DEV ? LogLevel.DEBUG : LogLevel.WARN;
  private logsBuffer: Array<{ timestamp: string; level: string; message: string }> = [];
  private maxBufferSize: number = 200; // Cap RAM consumption for QA diagnostics

  public setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  public debug(tag: string, message: string, ...optionalParams: any[]): void {
    if (this.currentLevel <= LogLevel.DEBUG) {
      console.log(`[DEBUG - ${tag}] ${message}`, ...optionalParams);
    }
    this.record('DEBUG', tag, message);
  }

  public info(tag: string, message: string, ...optionalParams: any[]): void {
    if (this.currentLevel <= LogLevel.INFO || IS_DEV) {
      console.log(`[INFO - ${tag}] ${message}`, ...optionalParams);
    }
    this.record('INFO', tag, message);
  }

  public warn(tag: string, message: string, ...optionalParams: any[]): void {
    if (this.currentLevel <= LogLevel.WARN) {
      console.warn(`[WARN - ${tag}] ${message}`, ...optionalParams);
    }
    this.record('WARN', tag, message);
  }

  public error(tag: string, message: string, error?: any): void {
    if (this.currentLevel <= LogLevel.ERROR) {
      console.error(`[ERROR - ${tag}] ${message}`, error || '');
    }
    this.record('ERROR', tag, `${message} ${error ? String(error) : ''}`);
  }

  /**
   * Performance instrumentation for Phase 21 QA benchmarking
   */
  public startTimer(label: string): () => number {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      if (IS_DEV) {
        console.log(`[PERF - ${label}] Executed in ${duration}ms`);
      }
      return duration;
    };
  }

  private record(level: string, tag: string, msg: string): void {
    if (this.logsBuffer.length >= this.maxBufferSize) {
      this.logsBuffer.shift(); // Evict oldest log to prevent memory leaks
    }
    this.logsBuffer.push({
      timestamp: new Date().toISOString(),
      level: `${level} - [${tag}]`,
      message: msg,
    });
  }

  public getDiagnosticLogs(): Array<{ timestamp: string; level: string; message: string }> {
    return [...this.logsBuffer];
  }

  public clearLogs(): void {
    this.logsBuffer = [];
  }
}

export const Logger = new ProductionLogger();
