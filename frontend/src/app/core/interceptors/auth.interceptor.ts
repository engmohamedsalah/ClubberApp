import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { LoggingService } from '../services/logging.service';

/**
 * Interceptor that adds authentication headers to outgoing requests
 * and handles token refresh when receiving 401 responses
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private loggingService: LoggingService) {}

  /**
   * Intercept HTTP requests to add auth token and handle 401 responses
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip authentication for public endpoints
    if (this.isPublicEndpoint(request.url)) {
      return next.handle(request);
    }

    // Add auth token to request
    const authToken = this.getAuthToken();
    if (authToken) {
      request = this.addTokenHeader(request, authToken);
    }

    // Handle the response and check for auth errors
    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Add authentication token to request headers
   */
  private addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  /**
   * Handle 401 Unauthorized errors
   * Attempts to refresh the token and retry the request
   */
  private handle401Error(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // If not already refreshing token
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      // For now, this is a placeholder for a real token refresh call
      // In a real app, you would call an auth service method to refresh the token
      return this.refreshToken().pipe(
        switchMap(token => {
          this.refreshTokenSubject.next(token);
          return next.handle(this.addTokenHeader(request, token));
        }),
        catchError(error => {
          // If refresh fails, log out the user
          this.logoutUser();
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // If currently refreshing, wait until the token is refreshed
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          return next.handle(this.addTokenHeader(request, token!));
        })
      );
    }
  }

  /**
   * Check if an endpoint is public (doesn't require authentication)
   */
  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password'];
    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Get the current authentication token from storage
   */
  private getAuthToken(): string {
    // In a real app, this would get the token from storage or state
    // For now, we'll return a dummy token or get from localStorage
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Refresh the authentication token
   * This is a placeholder - in a real app this would call your auth service
   */
  private refreshToken(): Observable<string> {
    // Mock implementation for now - This entire method is a placeholder
    // In a real app, this would call your auth service to refresh the token
    this.loggingService.logInfo('Refreshing authentication token (Placeholder - No actual refresh implemented)');

    // In production, this would be a real API call
    // return this.authService.refreshToken().pipe(
    //   map(response => response.token)
    // );
    return of(''); // Placeholder - returns an empty token
  }

  /**
   * Log out the user (called when token refresh fails)
   */
  private logoutUser(): void {
    // Clear local storage
    localStorage.removeItem('auth_token');

    // Redirect to login page
    // In a real app, this would use a router service
    // this.router.navigate(['/login']);

    this.loggingService.logWarning('User was logged out due to authentication failure');

    // Don't use window.location.href as it causes full page reloads and can lead to infinite reload loops
    // Instead, this should be implemented with Angular Router in a real application
    // window.location.href = '/login';

    // Just clear the token for now without navigation
    // The user will see auth errors and can navigate to login manually
  }
}
