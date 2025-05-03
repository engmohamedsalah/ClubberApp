import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, switchMap, tap, map, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Match, MatchStatus, MatchAvailability, MatchUIHelper } from '../models/match.model';
import { PaginatedResult } from '../models/pagination.model';
import { ApiService } from '../core/services/api.service';
import { LoggingService } from '../core/services/logging.service';
import { FeatureFlagService } from '../core/services/feature-flag.service';
import { MatchAdapter, MatchDto } from '../core/adapters/match.adapter';
import { PaginationAdapter, PaginatedResultDto } from '../core/adapters/pagination.adapter';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {
  private readonly ENDPOINT = 'Matches';

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
    // Initialize PaginationAdapter with LoggingService
    PaginationAdapter.initialize(this.loggingService);

    // Set up auto-refresh if enabled
    if (environment.autoRefreshInterval > 0) {
      timer(0, environment.autoRefreshInterval)
        .pipe(switchMap(() => this.fetchMatches()))
        .subscribe();
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
    filter?: 'Live' | 'Replay' | null,
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

          // Fallback to mock data in development
          if (!environment.production) {
            const mockResult = this.getMockPaginatedResult(page, pageSize);
            this.paginatedResultSubject.next(mockResult);
            this.matchesSubject.next(mockResult.data);
            return of(mockResult);
          }
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

    // If using real backend, search via API
    if (this.featureFlagService.isUsingRealBackend()) {
      const params = new HttpParams()
        .set('searchTerm', query.trim())
        .set('page', '1')
        .set('pageSize', '20');

      this.apiService.get<PaginatedResultDto<MatchDto>>(`${this.ENDPOINT}/search`, params)
        .pipe(
          map(dto => PaginationAdapter.fromApi(dto, MatchAdapter.fromApi)),
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
    } else {
      // For development, filter locally
      const currentMatches = this.matchesSubject.getValue();
      const searchTermLower = query.toLowerCase();

      const filteredMatches = currentMatches.filter(match =>
        match.competition.toLowerCase().includes(searchTermLower) ||
        match.title.toLowerCase().includes(searchTermLower)
      );

      this.matchesSubject.next(filteredMatches);
      this.loadingSubject.next(false);
    }
  }

  // Private method to fetch matches from API (non-paginated)
  private fetchMatches(filter?: 'Live' | 'Replay' | null): Observable<Match[]> {
    // Use mock data if we're not using the real backend
    if (!this.featureFlagService.isUsingRealBackend()) {
      this.loggingService.logInfo('Using mock match data');
      let mockData = this.getMockMatches();
      if (filter) {
        mockData = this.applyFilter(mockData, filter);
      }
      return of(mockData);
    }

    // Build params for the API request
    let params = new HttpParams();
    if (filter === 'Live') {
      params = params.set('status', MatchStatus.InProgress);
    } else if (filter === 'Replay') {
      params = params.set('status', MatchStatus.Completed);
    }

    // Use the resilient ApiService with retry
    return this.apiService.get<MatchDto[]>(this.ENDPOINT, params)
      .pipe(
        retry(2), // Try 3 times total (1 original + 2 retries)
        map(dtos => MatchAdapter.fromApiList(dtos))
      );
  }

  // Private method to fetch paginated matches from API
  private fetchPaginatedMatches(
    page = 1,
    pageSize = 10,
    filter?: 'Live' | 'Replay' | null,
    sortBy?: string,
    sortDescending?: boolean
  ): Observable<PaginatedResult<Match>> {
    // Use mock data if we're not using the real backend
    if (!this.featureFlagService.isUsingRealBackend()) {
      this.loggingService.logInfo('Using mock paginated match data');
      let mockData = this.getMockPaginatedResult(page, pageSize);
      if (filter) {
        // Apply filter to mock data
        mockData = {
          ...mockData,
          data: this.applyFilter(mockData.data, filter)
        };
      }
      return of(mockData);
    }

    // In production, use the API with retry
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    if (sortDescending !== undefined) {
      params = params.set('sortDescending', sortDescending.toString());
    }

    if (filter === 'Live') {
      params = params.set('status', MatchStatus.InProgress);
    } else if (filter === 'Replay') {
      params = params.set('status', MatchStatus.Completed);
    }

    // Use the resilient ApiService with retry
    return this.apiService.get<PaginatedResultDto<MatchDto>>(this.ENDPOINT, params)
      .pipe(
        retry(2), // Try 3 times total (1 original + 2 retries)
        map(dto => PaginationAdapter.fromApi(dto, MatchAdapter.fromApi))
      );
  }

  // Helper method to apply filters
  private applyFilter(matches: Match[], filter?: 'Live' | 'Replay' | null): Match[] {
    if (!filter) return matches;

    return matches.filter(match => {
      if (filter === 'Live') {
        return MatchUIHelper.isLive(match);
      } else { // 'Replay'
        return MatchUIHelper.isReplay(match);
      }
    });
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

  // Mock data for development and testing
  private getMockMatches(): Match[] {
    const mockData: Match[] = [
      {
        id: '1',
        title: 'Dublin vs Kerry',
        competition: 'Football Championship',
        date: new Date(),
        status: MatchStatus.InProgress,
        availability: MatchAvailability.Available,
        streamURL: 'https://example.com/stream/1'
      },
      {
        id: '2',
        title: 'Cork vs Tipperary',
        competition: 'Hurling Championship',
        date: new Date(Date.now() - 86400000), // Yesterday
        status: MatchStatus.Completed,
        availability: MatchAvailability.Available,
        streamURL: 'https://example.com/stream/2'
      },
      {
        id: '3',
        title: 'Mayo vs Galway',
        competition: 'Football Championship',
        date: new Date(Date.now() + 86400000), // Tomorrow
        status: MatchStatus.NotStarted,
        availability: MatchAvailability.Available,
        streamURL: 'https://example.com/stream/3'
      },
      {
        id: '4',
        title: 'Kilkenny vs Wexford',
        competition: 'Hurling Championship',
        date: new Date(),
        status: MatchStatus.InProgress,
        availability: MatchAvailability.Available,
        streamURL: 'https://example.com/stream/4'
      }
    ];

    return mockData;
  }

  // Mock paginated result for development and testing
  private getMockPaginatedResult(page: number, pageSize: number): PaginatedResult<Match> {
    const allMatches = this.getMockMatches();
    const totalCount = allMatches.length;

    // Calculate start and end indices
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalCount);

    // Get the slice of data for this page
    const data = allMatches.slice(startIndex, endIndex);

    return {
      data,
      page,
      pageSize,
      totalCount
    };
  }
}

