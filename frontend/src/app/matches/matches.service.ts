import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Match, MatchStatus, MatchAvailability, MatchUIHelper } from '../models/match.model';
import { PaginatedResult } from '../models/pagination.model';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {
  private apiUrl = `${environment.apiUrl}/api/Matches`;

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

  constructor(private http: HttpClient) {
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
    this.fetchMatches()
      .pipe(
        map(matches => this.applyFilter(matches, filter)),
        tap(matches => {
          this.matchesSubject.next(matches);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.errorSubject.next('Failed to load matches. Please try again.');
          this.loadingSubject.next(false);
          console.error('Error loading matches:', error);
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
          this.errorSubject.next('Failed to load matches. Please try again.');
          this.loadingSubject.next(false);
          console.error('Error loading paginated matches:', error);
          return of(this.getMockPaginatedResult(page, pageSize));
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

    const currentMatches = this.matchesSubject.getValue();
    const searchTermLower = query.toLowerCase();

    const filteredMatches = currentMatches.filter(match =>
      match.competition.toLowerCase().includes(searchTermLower) ||
      match.title.toLowerCase().includes(searchTermLower)
    );

    this.matchesSubject.next(filteredMatches);
  }

  // Private method to fetch matches from API (non-paginated)
  private fetchMatches(): Observable<Match[]> {
    // For development, use mock data
    if (!environment.production) {
      return of(this.getMockMatches()).pipe(
        tap(() => console.log('Using mock match data'))
      );
    }

    // In production, use the API
    return this.http.get<Match[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('API error when fetching matches:', error);
        return of(this.getMockMatches()); // Fallback to mock data
      })
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
    // For development, use mock data
    if (!environment.production) {
      return of(this.getMockPaginatedResult(page, pageSize)).pipe(
        tap(() => console.log('Using mock paginated match data'))
      );
    }

    // In production, use the API
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

    return this.http.get<PaginatedResult<Match>>(this.apiUrl, { params }).pipe(
      catchError(error => {
        console.error('API error when fetching paginated matches:', error);
        return of(this.getMockPaginatedResult(page, pageSize)); // Fallback to mock data
      })
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
      },
      {
        id: '5',
        title: 'Limerick vs Waterford',
        competition: 'Hurling Championship',
        date: new Date(Date.now() - 172800000), // 2 days ago
        status: MatchStatus.Completed,
        availability: MatchAvailability.Available,
        streamURL: 'https://example.com/stream/5'
      },
      {
        id: '6',
        title: 'Donegal vs Tyrone',
        competition: 'Football Championship',
        date: new Date(Date.now() + 172800000), // In 2 days
        status: MatchStatus.NotStarted,
        availability: MatchAvailability.Available,
        streamURL: 'https://example.com/stream/6'
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

