import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { LoggingService } from '../services/logging.service';

/**
 * Interceptor that handles HTTP errors in a centralized way
 * Provides consistent error handling across the application
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private loggingService: LoggingService) {}

  /**
   * Intercept HTTP requests to handle errors consistently
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Track request start time for performance monitoring
    const startTime = Date.now();

    // Add a request ID for tracking
    const requestId = this.generateRequestId();
    const trackedRequest = request.clone({
      setHeaders: {
        'X-Request-ID': requestId
      }
    });

    // Log outgoing requests in development
    this.logRequest(trackedRequest, requestId);

    // Handle the request and catch any errors
    return next.handle(trackedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        this.handleError(error, requestId);
        return throwError(() => error);
      }),
      finalize(() => {
        // Log request duration for performance monitoring
        const duration = Date.now() - startTime;
        this.loggingService.logDebug(`Request ${requestId} completed in ${duration}ms`);
      })
    );
  }

  /**
   * Generate a unique request ID for tracking
   */
  private generateRequestId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Log outgoing requests
   */
  private logRequest(request: HttpRequest<unknown>, requestId: string): void {
    this.loggingService.logDebug(`[${requestId}] ${request.method} ${request.url}`);
  }

  /**
   * Handle and log HTTP errors
   */
  private handleError(error: HttpErrorResponse, requestId: string): void {
    // Don't log 401 errors as they are handled by the auth interceptor
    if (error.status === 401) {
      return;
    }

    // Create a structured error object for logging
    const errorDetails = {
      requestId,
      url: error.url,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      timestamp: new Date().toISOString()
    };

    // Log different error types
    if (error.status === 0) {
      // Network error
      this.loggingService.logError('Network error', errorDetails);
    } else if (error.status === 404) {
      // Not found
      this.loggingService.logWarning('Resource not found', errorDetails);
    } else if (error.status >= 400 && error.status < 500) {
      // Client error
      this.loggingService.logWarning('Client error', errorDetails);
    } else if (error.status >= 500) {
      // Server error
      this.loggingService.logError('Server error', errorDetails);
    } else {
      // Other errors
      this.loggingService.logError('Unknown error', errorDetails);
    }
  }
}
