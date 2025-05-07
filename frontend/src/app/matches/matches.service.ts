import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, switchMap, tap, map, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Match, MatchStatus } from '../models/match.model';
import { PaginatedResult } from '../models/pagination.model';
import { ApiService } from '../core/services/api.service';
import { LoggingService } from '../core/services/logging.service';
import { FeatureFlagService } from '../core/services/feature-flag.service';
import { MatchAdapter, MatchDto } from '../core/adapters/match.adapter';
import { PaginationAdapter, PaginatedResultDto } from '../core/adapters/pagination.adapter';
import { ApiResponse, isApiResponse } from '../models/api-response.model';

// Define types that match the backend response structure
interface MatchesResponse {
  matches?: MatchDto[];
  data?: MatchDto[];
  items?: MatchDto[];
  results?: MatchDto[];
}

@Injectable({
  providedIn: 'root'
})
export class MatchesService {
  private readonly ENDPOINT: string;

  // State management
  private matchesSubject = new BehaviorSubject<Match[]>([]);
  private paginatedResultSubject = new BehaviorSubject<PaginatedResult<Match> | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  public matches$ = this.matchesSubject.asObservable();
  public paginatedResult$ = this.paginatedResultSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private loggingService: LoggingService,
    private featureFlagService: FeatureFlagService
  ) {
    // Configure API endpoint from environment
    this.ENDPOINT = `${environment.apiUrl}/Matches`;

    // Initialize PaginationAdapter with LoggingService
    PaginationAdapter.initialize(this.loggingService);

    // Log the auto-refresh interval value before checking it
    this.loggingService.logInfo('[MatchesService] Checking auto-refresh interval. Value:', environment.autoRefreshInterval);

    // Set up auto-refresh if enabled
    if (environment.autoRefreshInterval > 0) {
      this.loggingService.logInfo('[MatchesService] Setting up auto-refresh timer with interval:', environment.autoRefreshInterval);
      timer(0, environment.autoRefreshInterval)
        .pipe(
          tap(() => this.loggingService.logInfo('[MatchesService] Auto-refresh triggered. Fetching matches...')),
          switchMap(() => this.fetchMatches()),
          tap(matches => {
            const matchesArray = Array.isArray(matches) ? matches : [];
            this.matchesSubject.next(matchesArray);
            this.loggingService.logInfo('[MatchesService] Auto-refresh successfully updated matchesSubject with:', matchesArray);

            // Also update paginatedResultSubject for UI that binds to it
            // This is a simplified PaginatedResult based on the non-paginated fetch
            const refreshedPaginatedResult: PaginatedResult<Match> = {
              data: matchesArray,
              page: 1, // Assuming this refresh is like viewing the first page
              pageSize: matchesArray.length > 0 ? matchesArray.length : 10, // Or a default
              totalCount: matchesArray.length // Total count is just the current array length
            };
            this.paginatedResultSubject.next(refreshedPaginatedResult);
            this.loggingService.logInfo('[MatchesService] Auto-refresh also updated paginatedResultSubject with:', refreshedPaginatedResult);
          })
        )
        .subscribe({
          next: () => { /* Subjects are updated in the tap operator */ },
          error: (err) => this.loggingService.logError('[MatchesService] Error in auto-refresh timer observable:', err)
        });
    } else {
      this.loggingService.logInfo('[MatchesService] Auto-refresh is disabled (interval <= 0).');
    }
  }

  // Load all matches, with optional filter (non-paginated for backward compatibility)
  loadMatches(filter?: 'Live' | 'Replay' | null): void {
    this.loadingSubject.next(true);
    this.fetchMatches(filter)
      .pipe(
        tap(matches => {
          this.matchesSubject.next(matches);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.handleError('Failed to load matches. Please try again.', error);
          return of([]);
        })
      )
      .subscribe();
  }

  // Load paginated matches
  loadPaginatedMatches(
    page = 1,
    pageSize = 10,
    filter?: 'Live' | 'Replay' | 'Upcoming' | null,
    sortBy = 'date',
    sortDescending = true
  ): void {
    this.loadingSubject.next(true);
    this.fetchPaginatedMatches(page, pageSize, filter, sortBy, sortDescending)
      .pipe(
        tap(result => {
          this.paginatedResultSubject.next(result);
          this.matchesSubject.next(result.data); // Update matches array for compatibility
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.handleError('Failed to load matches. Please try again.', error);

          // No longer fallback to mock data in development on error, always return empty.
          return of(this.getEmptyPaginatedResult());
        })
      )
      .subscribe();
  }

  // Filter the current matches
  filterMatches(filter: 'Live' | 'Replay' | null): void {
    const currentMatches = this.matchesSubject.getValue();
    if (!filter) {
      this.loadMatches();
      return;
    }

    this.matchesSubject.next(this.applyFilter(currentMatches, filter));
  }

  // Search matches by title or competition
  searchMatches(query: string): void {
    if (!query.trim()) {
      this.loadMatches(); // Reload all if query is empty
      return;
    }

    this.loadingSubject.next(true);

    // ALWAYS using real backend, search via API
    const params = new HttpParams()
      .set('competition', query.trim())
      .set('page', '1')
      .set('pageSize', '20');

    this.apiService.get<ApiResponse<PaginatedResultDto<MatchDto>> | PaginatedResultDto<MatchDto>>(this.ENDPOINT, params)
      .pipe(
        tap(response => {
          // Log the response for debugging
          this.loggingService.logInfo('Search API response (using GetMatches with competition filter)', {
            type: typeof response,
            isArray: Array.isArray(response),
            isApiResponse: isApiResponse(response),
            structure: response ? JSON.stringify(response).substring(0, 100) + '...' : 'null/undefined'
          });
        }),
        map(response => {
          try {
            if (!response) {
              return this.getEmptyPaginatedResult(); // Handle empty response
            }

            // Case 1: ApiResponse wrapper
            if (isApiResponse<PaginatedResultDto<MatchDto>>(response)) {
              const paginatedData = response.data;
              if (!paginatedData) {
                return this.getEmptyPaginatedResult(); // Empty data
              }
              return PaginationAdapter.fromApi(paginatedData, MatchAdapter.fromApi);
            }

            // Case 2: Direct PaginatedResultDto
            return PaginationAdapter.fromApi(response as PaginatedResultDto<MatchDto>, MatchAdapter.fromApi);
          } catch (error) {
            this.loggingService.logError('Error in search PaginationAdapter.fromApi', { error, response });
            return this.getEmptyPaginatedResult();
          }
        }),
        tap((result: PaginatedResult<Match>) => {
          this.paginatedResultSubject.next(result);
          this.matchesSubject.next(result.data);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.handleError('Failed to search matches', error);
          return of(this.getEmptyPaginatedResult());
        })
      )
      .subscribe();
  }

  // Private method to fetch matches from API (non-paginated)
  private fetchMatches(filter?: 'Live' | 'Replay' | null): Observable<Match[]> {
    // ALWAYS using real backend
    // Build params for the API request
    let params = new HttpParams();
    if (filter === 'Live') {
      params = params.set('status', MatchStatus.Live);
    } else if (filter === 'Replay') {
      params = params.set('status', MatchStatus.OnDemand);
    }

    // Use the resilient ApiService with retry
    return this.apiService.get<ApiResponse<MatchesResponse> | MatchesResponse | MatchDto[]>(this.ENDPOINT, params)
      .pipe(
        retry(2), // Try 3 times total (1 original + 2 retries)
        tap(response => {
          // Log the response for debugging
          this.loggingService.logInfo('Matches API response', {
            type: typeof response,
            isArray: Array.isArray(response),
            isApiResponse: isApiResponse(response),
            hasData: response && typeof response === 'object' && 'data' in response,
            structure: response ? JSON.stringify(response).substring(0, 100) + '...' : 'null/undefined'
          });

          if (!response) {
            this.loggingService.logWarning('Empty response from matches API');
          }
        }),
        map(response => {
          try {
            if (!response) {
              return []; // Handle empty response
            }

            // Case 1: Direct array of DTOs
            if (Array.isArray(response)) {
              return MatchAdapter.fromApiList(response);
            }

            // Case 2: ApiResponse wrapper with MatchesResponse data
            if (isApiResponse<MatchesResponse>(response)) {
              const matchesData = response.data;
              if (!matchesData) {
                return []; // Empty data in the response
              }

              // Try to find the array in the various properties
              if (matchesData.matches && Array.isArray(matchesData.matches)) {
                return MatchAdapter.fromApiList(matchesData.matches);
              } else if (matchesData.data && Array.isArray(matchesData.data)) {
                return MatchAdapter.fromApiList(matchesData.data);
              } else if (matchesData.items && Array.isArray(matchesData.items)) {
                return MatchAdapter.fromApiList(matchesData.items);
              } else if (matchesData.results && Array.isArray(matchesData.results)) {
                return MatchAdapter.fromApiList(matchesData.results);
              }
            }

            // Case 3: Direct MatchesResponse object
            const matchesResponse = response as MatchesResponse;
            if (matchesResponse.matches && Array.isArray(matchesResponse.matches)) {
              return MatchAdapter.fromApiList(matchesResponse.matches);
            } else if (matchesResponse.data && Array.isArray(matchesResponse.data)) {
              return MatchAdapter.fromApiList(matchesResponse.data);
            } else if (matchesResponse.items && Array.isArray(matchesResponse.items)) {
              return MatchAdapter.fromApiList(matchesResponse.items);
            } else if (matchesResponse.results && Array.isArray(matchesResponse.results)) {
              return MatchAdapter.fromApiList(matchesResponse.results);
            }

            // Case 4: Fallback - search for any array property
            if (typeof response === 'object' && response !== null) {
              for (const key in response) {
                const value = (response as Record<string, unknown>)[key];
                if (Array.isArray(value)) {
                  this.loggingService.logInfo(`Found array property: ${key}, using it`);
                  return MatchAdapter.fromApiList(value);
                }
              }
            }

            // If we reach here, we couldn't find a usable array
            this.loggingService.logError('Could not extract matches array from response', { response });
            return []; // Return empty array if we couldn't find matches
          } catch (error) {
            this.loggingService.logError('Error processing matches response', { error, response });
            return []; // Return empty array on error
          }
        }),
        catchError(error => {
          this.loggingService.logError('Error fetching matches', error);
          return of([]); // Return empty array on error
        })
      );
  }

  // Private method to fetch paginated matches from API
  private fetchPaginatedMatches(
    page = 1,
    pageSize = 10,
    filter?: 'Live' | 'Replay' | 'Upcoming' | null,
    sortBy?: string,
    sortDescending?: boolean
  ): Observable<PaginatedResult<Match>> {
    // ALWAYS using real backend
    // In production, use the API with retry
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    // Log received filter parameter
    this.loggingService.logDebug('[MatchesService] fetchPaginatedMatches received filter:', filter);

    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    if (sortDescending !== undefined) {
      params = params.set('sortDescending', sortDescending.toString());
    }

    if (filter === 'Live') {
      params = params.set('status', MatchStatus.Live);
    } else if (filter === 'Replay') {
      params = params.set('status', MatchStatus.OnDemand);
    } else if (filter === 'Upcoming') {
      params = params.set('status', MatchStatus.Upcoming);
    }

    // Log final parameters before API call
    this.loggingService.logDebug('[MatchesService] fetchPaginatedMatches API params:', params.toString());

    // Use the resilient ApiService with retry
    return this.apiService.get<ApiResponse<PaginatedResultDto<MatchDto>> | PaginatedResultDto<MatchDto>>(this.ENDPOINT, params)
      .pipe(
        retry(2), // Try 3 times total (1 original + 2 retries)
        tap(response => {
          // Log the response for debugging
          this.loggingService.logInfo('Paginated Matches API response', {
            type: typeof response,
            isArray: Array.isArray(response),
            isApiResponse: isApiResponse(response),
            structure: response ? JSON.stringify(response).substring(0, 100) + '...' : 'null/undefined'
          });

          if (!response) {
            this.loggingService.logWarning('Empty response from paginated matches API');
          }
        }),
        map(response => {
          try {
            if (!response) {
              return this.getEmptyPaginatedResult(); // Handle empty response
            }

            // Case 1: ApiResponse wrapper
            if (isApiResponse<PaginatedResultDto<MatchDto>>(response)) {
              const paginatedData = response.data;
              if (!paginatedData) {
                return this.getEmptyPaginatedResult(); // Empty data
              }
              return PaginationAdapter.fromApi(paginatedData, MatchAdapter.fromApi);
            }

            // Case 2: Direct PaginatedResultDto
            return PaginationAdapter.fromApi(response as PaginatedResultDto<MatchDto>, MatchAdapter.fromApi);
          } catch (error) {
            this.loggingService.logError('Error processing paginated matches response', { error, response });
            return this.getEmptyPaginatedResult(); // Return empty result on error
          }
        }),
        catchError(error => {
          this.loggingService.logError('Error fetching paginated matches', error);
          return of(this.getEmptyPaginatedResult()); // Return empty result on error
        })
      );
  }

  // Helper method to apply filters
  private applyFilter(matches: Match[], filter?: 'Live' | 'Replay' | 'Upcoming' | null): Match[] {
    if (!filter) return matches;

    if (filter === 'Live') {
      return matches.filter(m => m.status === MatchStatus.Live);
    } else if (filter === 'Replay') {
      return matches.filter(m => m.status === MatchStatus.OnDemand);
    } else if (filter === 'Upcoming') {
      return matches.filter(m => m.status === MatchStatus.Upcoming);
    }
    return matches; // Should not happen if filter is one of the defined types
  }

  // Handle API errors
  private handleError(message: string, error: unknown): void {
    let userMessage = 'Sorry, we couldn\'t load the matches right now. Please try again in a moment or check your connection.';
    if (!navigator.onLine) {
      userMessage = 'You appear to be offline. Please check your internet connection.';
    } else if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status?: number }).status;
      if (status !== undefined) {
        if (status === 0) {
          userMessage = 'Cannot connect to the server. Please check your internet connection.';
        } else if (status === 404) {
          userMessage = 'The requested data could not be found.';
        } else if (status === 401 || status === 403) {
          userMessage = 'You are not authorized. Please log in again.';
        } else if (status >= 500) {
          userMessage = 'Server error. Please try again later.';
        }
      }
    }
    this.errorSubject.next(userMessage);
    this.loadingSubject.next(false);
    this.loggingService.logError('Error in MatchesService', error);
  }

  // Get empty paginated result
  private getEmptyPaginatedResult(): PaginatedResult<Match> {
    return {
      data: [],
      page: 1,
      pageSize: 10,
      totalCount: 0
    };
  }


  // Get a specific number of live matches
  getLiveMatches(count: number): Observable<Match[]> {
    return this.fetchPaginatedMatches(1, count, 'Live', 'date', true) // Fetch page 1, specified count, Live, sorted by date desc
      .pipe(
        map(result => result.data), // Extract only the data array
        catchError(error => {
          // Use the existing error handler but return an empty array for this specific call
          this.handleError('Failed to load live matches.', error);
          return of([]);
        })
      );
  }

  // Get a specific number of recent matches
  getRecentMatches(count: number): Observable<Match[]> {
    return this.fetchPaginatedMatches(1, count, null, 'date', true) // Fetch page 1, specified count, any status, sorted by date desc
      .pipe(
        map(result => result.data), // Extract only the data array
        catchError(error => {
          this.handleError('Failed to load recent matches.', error);
          return of([]);
        })
      );
  }

  // Get a specific number of upcoming matches
  getUpcomingMatches(count: number): Observable<Match[]> {
    return this.fetchPaginatedMatches(1, count, 'Upcoming', 'date', false) // Fetch page 1, count, Upcoming, sorted date ASC
      .pipe(
        map(result => result.data),
        catchError(error => {
          this.handleError('Failed to load upcoming matches.', error);
          return of([]);
        })
      );
  }

  // Get a specific number of replay matches
  getReplayMatches(count: number): Observable<Match[]> {
    return this.fetchPaginatedMatches(1, count, 'Replay', 'date', true) // Fetch page 1, count, Replay, sorted date DESC
      .pipe(
        map(result => result.data),
        catchError(error => {
          this.handleError('Failed to load replay matches.', error);
          return of([]);
        })
      );
  }

  // Mock data methods removed as isUsingRealBackend is now always true
  // private getMockMatches(): Match[] { ... }
  // private getMockPaginatedResult(page: number, pageSize: number): PaginatedResult<Match> { ... }
}

