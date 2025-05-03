import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Log levels for the application
 */
export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error'
}

/**
 * Service for handling application logging
 * Provides methods for logging messages at different levels
 * Supports console logging and remote logging to a server
 */
@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private readonly shouldLogToServer: boolean;
  private readonly logLevel: LogLevel;

  constructor() {
    this.shouldLogToServer = environment.logging?.sendErrorsToServer ?? false;
    this.logLevel = (environment.logging?.logLevelProduction as LogLevel) || LogLevel.Error;
  }

  /**
   * Log a debug message
   * @param message - The message to log
   * @param data - Optional data to include with the message
   */
  logDebug(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.Debug)) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  /**
   * Log an informational message
   * @param message - The message to log
   * @param data - Optional data to include with the message
   */
  logInfo(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.Info)) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  /**
   * Log a warning message
   * @param message - The message to log
   * @param data - Optional data to include with the message
   */
  logWarning(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.Warn)) {
      console.warn(`[WARNING] ${message}`, data);
    }
  }

  /**
   * Log an error message
   * @param message - The message to log
   * @param error - The error object or data to include
   */
  logError(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.Error)) {
      console.error(`[ERROR] ${message}`, error);

      // Send to server if enabled
      if (this.shouldLogToServer && error) {
        this.sendErrorToServer(message, error);
      }
    }
  }

  /**
   * Determine if a message at the given level should be logged
   * based on the configured log level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const configLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    // Log if the message level is >= the configured level
    return messageLevelIndex >= configLevelIndex;
  }

  /**
   * Send an error to the server for tracking
   * In a real app, this would send to an error tracking service
   */
  private sendErrorToServer(message: string, error: unknown): void {
    // This is a placeholder for actual server-side error logging
    // In a real app, this would use a service like Sentry, LogRocket, etc.
    if (!environment.production) {
      console.log('[Mock Error Reporting] Would send to server:', message, error);
    } else {
      // Production - would send to actual error tracking service
      // Example: Sentry.captureException(error, { extra: { message } });
    }
  }
}
