import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, map } from 'rxjs';
import { catchError, timeout, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoggingService } from './logging.service';

/**
 * Error class for API-related errors with user-friendly messages
 */
export class ApiError extends Error {
  constructor(
    public originalError: HttpErrorResponse,
    public userMessage = 'An error occurred while communicating with the server.'
  ) {
    super(userMessage);
    this.name = 'ApiError';
  }
}

/**
 * Resilient API service with backoff retry, timeouts, and graceful error handling
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(
    private http: HttpClient,
    private loggingService: LoggingService
  ) {
    this.apiUrl = environment.apiUrl;
    this.timeoutMs = environment.apiTimeoutMs || 30000;
    this.maxRetries = environment.maxRetries || 3;
    this.loggingService.logInfo('ApiService initialized', {
      apiUrl: this.apiUrl,
      timeoutMs: this.timeoutMs,
      maxRetries: this.maxRetries
    });
  }

  /**
   * Make a GET request to the API with resilient error handling
   */
  get<T>(endpoint: string, params?: HttpParams | Record<string, string | string[]>): Observable<T> {
    return this.http.get(`${this.buildUrl(endpoint)}`, {
      params,
      responseType: 'text'  // Get the raw response as text
    }).pipe(
      timeout(this.timeoutMs),
      // Use a more controlled retry strategy that doesn't interfere with Angular's chunking
      retry({
        count: this.maxRetries,
        delay: (error, retryCount) => {
          // Only retry for network errors and server (5xx) errors
          if (!(error instanceof HttpErrorResponse) ||
              (error.status !== 0 && (error.status < 500 || error.status >= 600))) {
            return throwError(() => error);
          }

          // Use a shorter backoff for GET requests (500ms base)
          const delay = Math.min(Math.pow(1.5, retryCount) * 500, 5000);
          this.loggingService.logWarning(`Retrying GET request (${retryCount}/${this.maxRetries}) after ${delay}ms delay`, {
            url: error.url,
            status: error.status
          });

          return timer(delay);
        }
      }),
      // Manually parse the JSON to better handle parsing errors
      map((text: string) => {
        try {
          return JSON.parse(text) as T;
        } catch (error) {
          this.loggingService.logError('JSON parsing error', {
            text: text.substring(0, 100) + '...',  // Log the start of the response
            error
          });
          throw new Error('Error parsing JSON response');
        }
      }),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Make a POST request to the API with resilient error handling
   */
  post<T>(endpoint: string, body: unknown, options?: Record<string, unknown>): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, options)
      .pipe(
        timeout(this.timeoutMs),
        this.retryWithBackoff(),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Make a PUT request to the API with resilient error handling
   */
  put<T>(endpoint: string, body: unknown, options?: Record<string, unknown>): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, options)
      .pipe(
        timeout(this.timeoutMs),
        this.retryWithBackoff(),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Make a DELETE request to the API with resilient error handling
   */
  delete<T>(endpoint: string, options?: Record<string, unknown>): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), options)
      .pipe(
        timeout(this.timeoutMs),
        this.retryWithBackoff(),
        catchError(error => this.handleError(error))
      );
  }

  /**
   * Build a complete URL for API requests
   */
  private buildUrl(endpoint: string): string {
    // Check if endpoint already starts with the API URL to prevent double prefixing
    if (endpoint.startsWith('http') || endpoint.startsWith('/')) {
      return endpoint;
    }

    // Ensure apiUrl doesn't end with a slash
    const baseUrl = this.apiUrl.endsWith('/')
      ? this.apiUrl.substring(0, this.apiUrl.length - 1)
      : this.apiUrl;

    return `${baseUrl}/${endpoint}`;
  }

  /**
   * Retry with exponential backoff strategy
   * Only retries for network errors and 5xx server errors
   */
  private retryWithBackoff<T>() {
    return (source: Observable<T>) => source.pipe(
      retry({
        count: this.maxRetries,
        delay: (error, retryCount) => {
          // Only retry for network errors and server (5xx) errors
          if (!(error instanceof HttpErrorResponse) ||
              (error.status !== 0 && (error.status < 500 || error.status >= 600))) {
            return throwError(() => error);
          }

          // Calculate exponential backoff delay (2^count * 1000ms)
          const delay = Math.min(Math.pow(2, retryCount) * 1000, 30000);
          this.loggingService.logWarning(`Retrying API request (${retryCount}/${this.maxRetries}) after ${delay}ms delay`, {
            url: error.url,
            status: error.status
          });

          return timer(delay);
        }
      })
    );
  }

  /**
   * Centralized error handling for API requests
   */
  private handleError(error: unknown): Observable<never> {
    let apiError: ApiError;

    if (error instanceof HttpErrorResponse) {
      // Handle HTTP errors with user-friendly messages
      let userMessage = 'An error occurred while communicating with the server.';

      if (error.status === 0) {
        userMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.status === 401) {
        userMessage = 'Your session has expired. Please sign in again.';
      } else if (error.status === 403) {
        userMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        userMessage = 'The requested resource was not found.';
      } else if (error.status >= 500) {
        userMessage = 'A server error occurred. Please try again later.';
      }

      apiError = new ApiError(error, userMessage);

      // Log detailed error information
      this.loggingService.logError('API Error', {
        status: error.status,
        url: error.url,
        message: error.message,
        errorBody: error.error
      });
    } else {
      // Handle non-HTTP errors
      apiError = new ApiError(
        new HttpErrorResponse({ error, status: 0, statusText: 'Unknown Error' }),
        'An unexpected error occurred. Please try again.'
      );

      this.loggingService.logError('Non-HTTP API Error', error);
    }

    return throwError(() => apiError);
  }
}
