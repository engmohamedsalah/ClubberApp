import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { LoggingService } from '../services/logging.service';

/**
 * A simple in-memory cache for HTTP responses
 */
interface CacheEntry {
  response: HttpResponse<unknown>;
  timestamp: number;
}

/**
 * Interceptor that caches HTTP GET responses to improve performance
 */
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();
  private readonly cacheTtl = 5 * 60 * 1000; // 5 minutes TTL by default
  private readonly maxCacheSize = 100; // Maximum cache entries

  constructor(private loggingService: LoggingService) {}

  /**
   * Intercept HTTP requests to provide caching for GET requests
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    // Skip caching for specific endpoints
    if (this.shouldSkipCache(request.url)) {
      return next.handle(request);
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey(request);

    // Check if we have a cached response
    const cachedResponse = this.getFromCache(cacheKey);
    if (cachedResponse) {
      this.loggingService.logDebug(`Cache hit for ${request.url}`);
      return of(cachedResponse);
    }

    // No cache hit, get from network and cache the response
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.addToCache(cacheKey, event);
        }
      }),
      // Use shareReplay to avoid multiple HTTP requests if multiple subscribers
      shareReplay(1)
    );
  }

  /**
   * Generate a cache key for a request
   */
  private generateCacheKey(request: HttpRequest<unknown>): string {
    // Create key from URL and query params
    return `${request.url}|${request.params.toString()}`;
  }

  /**
   * Check if a URL should skip caching
   */
  private shouldSkipCache(url: string): boolean {
    // Skip URLs that shouldn't be cached
    const nonCacheableEndpoints = [
      '/api/auth',    // Auth endpoints
      '/api/user',    // User data
      '/api/metrics', // Metrics/analytics
      '/api/v1/Matches', // Skip caching for matches list
      '/api/v1/Playlist' // Skip caching for playlist
    ];

    return nonCacheableEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Get a response from cache if it exists and is not expired
   */
  private getFromCache(key: string): HttpResponse<unknown> | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry is expired
    const now = Date.now();
    if (now - entry.timestamp > this.cacheTtl) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  /**
   * Add a response to the cache
   */
  private addToCache(key: string, response: HttpResponse<unknown>): void {
    // Don't cache error responses
    if (!this.isCacheable(response)) {
      return;
    }

    // Ensure we don't exceed max cache size (simple LRU: just delete oldest)
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) { this.cache.delete(oldestKey); }
    }

    // Add to cache with current timestamp
    const entry: CacheEntry = {
      response,
      timestamp: Date.now()
    };

    this.cache.set(key, entry);
    this.loggingService.logDebug(`Cached response for ${key}`);
  }

  /**
   * Check if a response is cacheable
   */
  private isCacheable(response: HttpResponse<unknown>): boolean {
    // Only cache successful responses
    return response.ok;
  }

  /**
   * Clear the entire cache or entries matching a URL pattern
   */
  clearCache(urlPattern?: string): void {
    if (!urlPattern) {
      this.cache.clear();
      this.loggingService.logInfo('Cleared entire HTTP cache');
      return;
    }

    // Clear by URL pattern
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (urlPattern && key.includes(urlPattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    this.loggingService.logInfo(`Cleared cache entries matching: ${urlPattern}`);
  }
}
