import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

// Define interfaces matching backend DTOs
interface AuthResponseDto {
  succeeded: boolean;
  message: string;
  token?: string;
  user?: User;
}

// Login request DTO
interface LoginDto {
  username: string;
  password: string;
}

// Register request DTO
interface RegisterDto {
  username: string;
  password: string;
  email?: string; // Not used by backend currently
}

@Injectable({
  providedIn: 'root' // Provide service at the root level
})
export class AuthService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}/Auth`;
  }

  login(username: string, password: string): Observable<AuthResponseDto> {
    const loginDto: LoginDto = { username, password };
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/login`, loginDto);
  }

  register(username: string, email: string, password: string): Observable<AuthResponseDto> {
    // Backend expects username and password
    const registerDto: RegisterDto = { username, password, email };
    return this.http.post<AuthResponseDto>(`${this.apiUrl}/register`, registerDto);
  }

  // Store token in localStorage
  storeToken(token: string, username = 'User'): void {
    localStorage.setItem('auth_token', token);
    // Also store authUser for compatibility with app component
    localStorage.setItem('authUser', JSON.stringify({ username, role: 'user' }));
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Remove token from localStorage
  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

