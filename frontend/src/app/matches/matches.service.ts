import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Match, MatchStatus, MatchAvailability } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {
  private apiUrl = `${environment.apiUrl}/api/Matches`;

  // State management
  private matchesSubject = new BehaviorSubject<Match[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Public observables
  public matches$ = this.matchesSubject.asObservable();
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

  // Load all matches, with optional filter
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

  // Private method to fetch matches from API
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

  // Helper method to apply filters
  private applyFilter(matches: Match[], filter?: 'Live' | 'Replay' | null): Match[] {
    if (!filter) return matches;

    return matches.filter(match =>
      filter === 'Live' ? match.isLive : match.isReplay
    );
  }

  // Mock data for development and testing
  private getMockMatches(): Match[] {
    return [
      {
        id: '1',
        title: 'Dublin vs Kerry',
        competition: 'Football Championship',
        date: new Date(),
        status: MatchStatus.InProgress,
        availability: MatchAvailability.Available,
        teams: ['Dublin', 'Kerry'],
        location: 'Croke Park, Dublin',
        isLive: true,
        isReplay: false,
        streamURL: 'https://example.com/stream/1',
        thumbnail: 'https://placehold.co/600x400/indigo/white?text=Dublin+vs+Kerry'
      },
      {
        id: '2',
        title: 'Cork vs Tipperary',
        competition: 'Hurling Championship',
        date: new Date(Date.now() - 86400000), // Yesterday
        status: MatchStatus.Completed,
        availability: MatchAvailability.Available,
        teams: ['Cork', 'Tipperary'],
        location: 'Páirc Uí Chaoimh, Cork',
        isLive: false,
        isReplay: true,
        streamURL: 'https://example.com/stream/2',
        thumbnail: 'https://placehold.co/600x400/indigo/white?text=Cork+vs+Tipperary'
      },
      {
        id: '3',
        title: 'Mayo vs Galway',
        competition: 'Football Championship',
        date: new Date(Date.now() + 86400000), // Tomorrow
        status: MatchStatus.NotStarted,
        availability: MatchAvailability.Available,
        teams: ['Mayo', 'Galway'],
        location: 'MacHale Park, Castlebar',
        isLive: false,
        isReplay: false,
        streamURL: 'https://example.com/stream/3',
        thumbnail: 'https://placehold.co/600x400/indigo/white?text=Mayo+vs+Galway'
      },
      {
        id: '4',
        title: 'Kilkenny vs Wexford',
        competition: 'Hurling Championship',
        date: new Date(),
        status: MatchStatus.InProgress,
        availability: MatchAvailability.Available,
        teams: ['Kilkenny', 'Wexford'],
        location: 'Nowlan Park, Kilkenny',
        isLive: true,
        isReplay: false,
        streamURL: 'https://example.com/stream/4',
        thumbnail: 'https://placehold.co/600x400/indigo/white?text=Kilkenny+vs+Wexford'
      },
      {
        id: '5',
        title: 'Limerick vs Waterford',
        competition: 'Hurling Championship',
        date: new Date(Date.now() - 172800000), // 2 days ago
        status: MatchStatus.Completed,
        availability: MatchAvailability.Available,
        teams: ['Limerick', 'Waterford'],
        location: 'Gaelic Grounds, Limerick',
        isLive: false,
        isReplay: true,
        streamURL: 'https://example.com/stream/5',
        thumbnail: 'https://placehold.co/600x400/indigo/white?text=Limerick+vs+Waterford'
      },
      {
        id: '6',
        title: 'Donegal vs Tyrone',
        competition: 'Football Championship',
        date: new Date(Date.now() + 172800000), // In 2 days
        status: MatchStatus.NotStarted,
        availability: MatchAvailability.Available,
        teams: ['Donegal', 'Tyrone'],
        location: 'MacCumhaill Park, Ballybofey',
        isLive: false,
        isReplay: false,
        streamURL: 'https://example.com/stream/6',
        thumbnail: 'https://placehold.co/600x400/indigo/white?text=Donegal+vs+Tyrone'
      }
    ];
  }
}

