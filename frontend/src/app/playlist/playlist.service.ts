import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Match, MatchStatus, MatchAvailability } from '../models/match.model';
import { Playlist, PlaylistActionResult } from '../models/playlist.model';

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

  constructor(private http: HttpClient) {
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

    // In production, use API
    this.http.get<Playlist>(this.apiUrl).pipe(
      map(playlist => {
        // Ensure playlist and matches exist
        if (!playlist || !playlist.matches) {
          return { matches: [] };
        }
        // Ensure all matches adhere to backend model structure
        return {
          ...playlist,
          matches: playlist.matches.map(this.ensureMatchFormat)
        };
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
    this.http.post<PlaylistActionResult>(`${this.apiUrl}/${formattedMatch.id}`, {}).pipe(
      map(result => {
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
      }),
      tap(result => {
        if (result.succeeded) {
          this.playlistSubject.next(result.playlist?.matches || []);
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

    // In development, use local storage
    if (!environment.production) {
      const updatedPlaylist = currentPlaylist.filter(m => m.id !== matchId);
      this.playlistSubject.next(updatedPlaylist);
      this.saveToLocalStorage(updatedPlaylist);
      this.showNotification(`${matchToRemove.title} removed from your playlist!`, 'success');
      return;
    }

    // In production, use API
    this.loadingSubject.next(true);
    this.http.delete<PlaylistActionResult>(`${this.apiUrl}/${matchId}`).pipe(
      map(result => {
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
      }),
      tap(result => {
        if (result.succeeded) {
          this.playlistSubject.next(result.playlist?.matches || []);
          this.showNotification(`Match removed from your playlist!`, 'success');
        } else {
          this.errorSubject.next(result.message);
          this.showNotification(result.message, 'error');
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => this.handleError('Failed to remove match from playlist', error))
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
  private ensureMatchFormat(match: Partial<Match>): Match {
    // Extract only the properties present in the backend model
    return {
      id: match.id || '',
      title: match.title || '',
      competition: match.competition || '',
      date: match.date || new Date(),
      status: match.status || MatchStatus.Upcoming,
      availability: match.availability || MatchAvailability.Available,
      streamURL: match.streamURL || ''
    };
  }

  // Show notification helper method
  private showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationSubject.next({ message, type });
  }

  // Error handling helper method
  private handleError(errorMessage: string, error: HttpErrorResponse | Error): Observable<PlaylistActionResult> {
    console.error(`${errorMessage}:`, error);
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

