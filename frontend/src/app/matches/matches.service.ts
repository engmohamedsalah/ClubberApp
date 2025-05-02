import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Create environment files later
import { Match } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchesService {
  private apiUrl = `${environment.apiUrl}/api/Matches`; // Adjust API URL as needed

  constructor(private http: HttpClient) { }

  // Method to get all matches
  getMatches(): Observable<Match[]> {
    // Note: In a real app, you'd likely add an interceptor to attach the JWT token
    // For now, we assume the endpoint is either public or token is handled elsewhere
    return this.http.get<Match[]>(this.apiUrl);
  }

  // Add other methods if needed (e.g., getMatchById, searchMatches)
}

