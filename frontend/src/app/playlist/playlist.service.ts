import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Playlist, PlaylistActionResult } from '../models/playlist.model'; // Import PlaylistActionResult

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private apiUrl = `${environment.apiUrl}/api/Playlist`; // Adjust API URL as needed

  constructor(private http: HttpClient) { }

  // Method to get the user's playlist
  getPlaylist(): Observable<Playlist> {
    // Assumes the backend endpoint returns the playlist for the authenticated user
    // Requires JWT token to be sent (handled by interceptor later)
    return this.http.get<Playlist>(this.apiUrl);
  }

  // Method to add a match to the playlist
  // Renamed method, updated matchId type to string, updated return type
  addMatchToPlaylist(matchId: string): Observable<PlaylistActionResult> {
    // Requires JWT token
    // Backend expects POST to /api/Playlist/{matchId}
    return this.http.post<PlaylistActionResult>(`${this.apiUrl}/${matchId}`, {});
  }

  // Method to remove a match from the playlist
  // Renamed method, updated matchId type to string, updated return type
  removeMatchFromPlaylist(matchId: string): Observable<PlaylistActionResult> {
    // Requires JWT token
    // Backend expects DELETE to /api/Playlist/{matchId}
    return this.http.delete<PlaylistActionResult>(`${this.apiUrl}/${matchId}`);
  }
}

