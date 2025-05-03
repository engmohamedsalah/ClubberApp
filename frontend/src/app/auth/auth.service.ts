import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; // Create environment files later
import { User } from '../models/user.model'; // Create this model later

// Define interfaces for API request/response payloads
interface AuthResponse {
  token: string;
  user: User; // Assuming the backend returns user info on login
}

interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root' // Provide service at the root level
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/Auth`; // Adjust API URL as needed

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password });
  }

  register(username: string, email: string, password: string): Observable<RegisterResponse> {
    // Assuming backend expects an object with these properties
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, { username, email, password });
  }

  // Optional: Add method to store/retrieve token from localStorage/sessionStorage
  // Optional: Add method to check token validity/expiration
}

