import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable()
export class ProfileService {
  private readonly apiUrl = '/api/v1/profile';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(this.apiUrl);
  }

  updateProfile(data: { username: string; email: string }): Observable<User> {
    return this.http.put<User>(this.apiUrl, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/password`, data);
  }
}
