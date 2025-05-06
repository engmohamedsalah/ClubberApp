import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Match, MatchStatus, MatchAvailability } from '../models/match.model';
import { Playlist, PlaylistActionResult } from '../models/playlist.model';
import { ApiResponse, isApiResponse } from '../models/api-response.model';
import { LoggingService } from '../core/services/logging.service';
import { PaginatedResult } from '../models/pagination.model';
import { MatchDto, mapMatchAvailability, mapMatchStatus } from '../core/adapters/match.adapter';

// Type guard for PaginatedResult<MatchDto>
function isPaginatedResultMatchDto(obj: unknown): obj is PaginatedResult<MatchDto> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'data' in obj &&
    Array.isArray((obj as PaginatedResult<MatchDto>).data) &&
    'page' in obj &&
    'pageSize' in obj &&
    'totalCount' in obj
  );
}

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private apiUrl: string;

  // State management
  private playlistSubject = new BehaviorSubject<Match[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  private notificationSubject = new BehaviorSubject<{message: string, type: 'success' | 'error'} | null>(null);

  // Public observables
  public playlist$ = this.playlistSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public notification$ = this.notificationSubject.asObservable();

  constructor(private http: HttpClient, private loggingService: LoggingService) {
    // Configure API URL from environment
    this.apiUrl = `${environment.apiUrl}/Playlist`;

    // Load playlist from local storage on init
    this.loadFromLocalStorage();
  }

  // Load playlist
  loadPlaylist(): void {
    this.loadingSubject.next(true);

    // In development, use local storage
    if (!environment.production) {
      this.loadFromLocalStorage();
      this.loadingSubject.next(false);
      return;
    }

    // In production, use API - Expecting PaginatedResult<MatchDto> based on backend controller
    this.http.get<ApiResponse<PaginatedResult<MatchDto>> | PaginatedResult<MatchDto>>(this.apiUrl).pipe(
      tap(response => {
        // Log the response for debugging
        this.loggingService.logInfo('Playlist API response', {
          type: typeof response,
          isApiResponse: isApiResponse(response),
          isPaginatedResult: isPaginatedResultMatchDto(response),
          structure: response ? JSON.stringify(response).substring(0, 100) + '...' : 'null/undefined'
        });

        if (!response) {
          this.loggingService.logWarning('Empty response from playlist API');
        }
      }),
      map(response => {
        try {
          let matchesDto: MatchDto[] = [];

          if (!response) {
            return { matches: [] }; // Handle empty response
          }

          // Case 1: ApiResponse wrapper containing PaginatedResult<MatchDto>
          if (isApiResponse<PaginatedResult<MatchDto>>(response)) {
            const paginatedData = response.data;
            if (paginatedData && paginatedData.data) {
              matchesDto = paginatedData.data;
            }
          }
          // Case 2: Direct PaginatedResult<MatchDto>
          else if (isPaginatedResultMatchDto(response)) {
            if (response.data) {
              matchesDto = response.data;
            }
          }
          // Case 3: Fallback for direct Playlist object (less likely based on backend code)
          else if ((response as Playlist).matches) {
             this.loggingService.logWarning('Received direct Playlist object, expected PaginatedResult');
             // If it's a Playlist object, the matches are already of type Match[]
             const matches = (response as Playlist).matches;
             return { matches }; // Return directly
          }

          // If we found DTOs, map them, otherwise return empty
          if (matchesDto.length > 0) {
            // Map MatchDto[] to Match[] using standalone functions
            const matches = matchesDto.map(dto => ({
                id: dto.id || '',
                title: dto.title || '',
                competition: dto.competition || '',
                date: dto.date ? new Date(dto.date) : new Date(),
                status: mapMatchStatus(dto.status),
                availability: mapMatchAvailability(dto.availability),
                streamURL: dto.streamURL || ''
            } as Match));
            return { matches };
          } else {
             return { matches: [] }; // No usable match data found
          }

        } catch (error) {
          this.loggingService.logError('Error processing playlist response', { error, response });
          return { matches: [] }; // Return empty playlist on error
        }
      }),
      tap(playlist => {
        this.playlistSubject.next(playlist.matches);
        this.loadingSubject.next(false);
      }),
      catchError(error => this.handleError('Failed to load playlist', error))
    ).subscribe();
  }

  // Add match to playlist
  addToPlaylist(match: Match): void {
    // Ensure match conforms to backend model
    const formattedMatch = this.ensureMatchFormat(match);

    // Check if match is already in playlist
    const currentPlaylist = this.playlistSubject.getValue();
    if (currentPlaylist.some(m => m.id === formattedMatch.id)) {
      this.showNotification('This match is already in your playlist.', 'error');
      return;
    }

    // In development, use local storage
    if (!environment.production) {
      const updatedPlaylist = [...currentPlaylist, formattedMatch];
      this.playlistSubject.next(updatedPlaylist);
      this.saveToLocalStorage(updatedPlaylist);
      this.showNotification(`${formattedMatch.title} added to your playlist!`, 'success');
      return;
    }

    // In production, use API
    this.loadingSubject.next(true);
    this.http.post<ApiResponse<PlaylistActionResult> | PlaylistActionResult>(`${this.apiUrl}/${formattedMatch.id}`, {}).pipe(
      tap(response => {
        // Log the response for debugging
        this.loggingService.logInfo('Add to playlist response', {
          type: typeof response,
          isApiResponse: isApiResponse(response),
          structure: response ? JSON.stringify(response).substring(0, 100) + '...' : 'null/undefined'
        });
      }),
      map(response => {
        try {
          // Handle ApiResponse wrapper
          if (isApiResponse<PlaylistActionResult>(response)) {
            const result = response.data;
            if (!result) {
              return { succeeded: false, message: 'Empty response', playlist: null };
            }

            if (result.playlist && result.playlist.matches) {
              return {
                ...result,
                playlist: {
                  ...result.playlist,
                  matches: result.playlist.matches.map(this.ensureMatchFormat)
                }
              };
            }
            return {
              ...result,
              playlist: { matches: [] }
            };
          }

          // Handle direct result object
          const result = response as PlaylistActionResult;
          if (result.playlist && result.playlist.matches) {
            return {
              ...result,
              playlist: {
                ...result.playlist,
                matches: result.playlist.matches.map(this.ensureMatchFormat)
              }
            };
          }
          return {
            ...result,
            playlist: { matches: [] }
          };
        } catch (error) {
          this.loggingService.logError('Error processing add to playlist response', { error, response });
          return { succeeded: false, message: 'Error processing response', playlist: null };
        }
      }),
      tap(result => {
        if (result.succeeded) {
          // Optimistically add the match to the current playlist state
          const currentPlaylist = this.playlistSubject.getValue();
          // Ensure we don't add duplicates if the backend already included it (or if clicked twice quickly)
          if (!currentPlaylist.some(m => m.id === formattedMatch.id)) {
             const updatedPlaylist = [...currentPlaylist, formattedMatch];
             this.playlistSubject.next(updatedPlaylist);
          }
          // Optionally, reconcile with backend response if it contains a playlist
          else if (result.playlist && result.playlist.matches) {
            // If backend *did* return a playlist, use that as the source of truth
            // (This handles cases like 'already in playlist' correctly)
            this.playlistSubject.next(result.playlist.matches.map(this.ensureMatchFormat));
          }
          // else: Backend succeeded but didn't return a playlist - rely on optimistic update

          this.showNotification(`${formattedMatch.title} added to your playlist!`, 'success');
        } else {
          this.errorSubject.next(result.message);
          this.showNotification(result.message, 'error');
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => this.handleError('Failed to add match to playlist', error))
    ).subscribe();
  }

  // Remove match from playlist
  removeFromPlaylist(matchId: string): void {
    const currentPlaylist = this.playlistSubject.getValue();
    const matchToRemove = currentPlaylist.find(m => m.id === matchId);

    if (!matchToRemove) {
      return; // Match not in playlist
    }

    // Optimistically remove from frontend state immediately
    const optimisticPlaylist = currentPlaylist.filter(m => m.id !== matchId);
    this.playlistSubject.next(optimisticPlaylist);

    // In development, use local storage
    if (!environment.production) {
      this.saveToLocalStorage(optimisticPlaylist);
      this.showNotification(`${matchToRemove.title} removed from your playlist!`, 'success');
      return;
    }

    // In production, call API
    this.loadingSubject.next(true);
    this.http.delete<ApiResponse<PlaylistActionResult> | PlaylistActionResult>(`${this.apiUrl}/${matchId}`).pipe(
      tap(response => {
        // Log the response for debugging
        this.loggingService.logInfo('Remove from playlist response', {
          type: typeof response,
          isApiResponse: isApiResponse(response),
          structure: response ? JSON.stringify(response).substring(0, 100) + '...' : 'null/undefined'
        });
      }),
      map(response => {
        try {
          // Handle ApiResponse wrapper
          if (isApiResponse<PlaylistActionResult>(response)) {
            const result = response.data;
            if (!result) {
              return { succeeded: false, message: 'Empty response', playlist: null };
            }

            if (result.playlist && result.playlist.matches) {
              return {
                ...result,
                playlist: {
                  ...result.playlist,
                  matches: result.playlist.matches.map(this.ensureMatchFormat)
                }
              };
            }
            return {
              ...result,
              playlist: { matches: [] }
            };
          }

          // Handle direct result object
          const result = response as PlaylistActionResult;
          if (result.playlist && result.playlist.matches) {
            return {
              ...result,
              playlist: {
                ...result.playlist,
                matches: result.playlist.matches.map(this.ensureMatchFormat)
              }
            };
          }
          return {
            ...result,
            playlist: { matches: [] }
          };
        } catch (error) {
          this.loggingService.logError('Error processing remove from playlist response', { error, response });
          return { succeeded: false, message: 'Error processing response', playlist: null };
        }
      }),
      tap(result => {
        if (result.succeeded) {
          // Backend confirmed success. If it returned a playlist, use it as source of truth.
          if (result.playlist && result.playlist.matches) {
             this.playlistSubject.next(result.playlist.matches.map(this.ensureMatchFormat));
          }
          // else: Backend succeeded but didn't return playlist, rely on optimistic update
          this.showNotification(`Match removed from your playlist!`, 'success');
        } else {
          // Removal failed on backend, revert optimistic update
          this.playlistSubject.next(currentPlaylist);
          this.errorSubject.next(result.message);
          this.showNotification(result.message, 'error');
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        // Revert optimistic update on error
        this.playlistSubject.next(currentPlaylist);
        return this.handleError('Failed to remove match from playlist', error);
      })
    ).subscribe();
  }

  // Check if a match is in the playlist
  isInPlaylist(matchId: string): boolean {
    return this.playlistSubject.getValue().some(m => m.id === matchId);
  }

  // Clear notification after it's been shown
  clearNotification(): void {
    this.notificationSubject.next(null);
  }

  // Ensure match object adheres to backend model structure
  private ensureMatchFormat(match: Partial<Match> | MatchDto): Match {
      // Check if it looks like a DTO (has string date/status/availability)
      const isDto = typeof match.date === 'string' || typeof match.status === 'string' || typeof match.availability === 'string';

      return {
        id: match.id || '',
        title: match.title || '',
        competition: match.competition || '',
        date: match.date ? new Date(match.date) : new Date(), // Handles both Date and string date
        status: isDto ? mapMatchStatus(match.status as string) : (match.status || MatchStatus.Upcoming),
        availability: isDto ? mapMatchAvailability(match.availability as string) : (match.availability || MatchAvailability.Unavailable),
        streamURL: match.streamURL || ''
      };
  }

  // Show notification helper method
  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationSubject.next({ message, type });
  }

  // Error handling helper method
  private handleError(errorMessage: string, error: HttpErrorResponse | Error): Observable<PlaylistActionResult> {
    this.loggingService.logError(errorMessage, error);
    this.errorSubject.next(`${errorMessage}. Please try again.`);
    this.loadingSubject.next(false);
    this.showNotification(errorMessage, 'error');
    return of({ succeeded: false, message: 'Error', playlist: null });
  }

  // Helper methods for local storage
  private loadFromLocalStorage(): void {
    try {
      const savedPlaylist = localStorage.getItem('clubber_playlist');
      if (savedPlaylist) {
        const matches = JSON.parse(savedPlaylist);
        // Ensure all matches loaded from storage follow backend model
        if (Array.isArray(matches)) {
          this.playlistSubject.next(matches.map(this.ensureMatchFormat));
        } else {
          // Initialize with empty array if matches is not an array
          this.playlistSubject.next([]);
        }
      } else {
        // Initialize with empty array if no playlist in localStorage
        this.playlistSubject.next([]);
      }
    } catch (error) {
      console.error('Error loading playlist from local storage:', error);
      // Initialize with empty array on error
      this.playlistSubject.next([]);
    }
  }

  private saveToLocalStorage(playlist: Match[]): void {
    try {
      localStorage.setItem('clubber_playlist', JSON.stringify(playlist));
    } catch (error) {
      console.error('Error saving playlist to local storage:', error);
    }
  }
}

