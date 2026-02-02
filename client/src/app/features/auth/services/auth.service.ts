import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  PasswordResetConfirm,
  LoginRequest,
  RegisterRequest,
  ActivateAccountRequest,
  AuthResponse,
} from '../interfaces/auth.interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/users';

  constructor() {}

  /**
   * REGISTRO: POST /api/users/
   */
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  /**
   * LOGIN: POST /api/users/login/
   */
  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, data).pipe(
      tap((response: any) => {
        // Guardar tokens en localStorage
        localStorage.setItem('access_token', response.tokens.access);
        localStorage.setItem('refresh_token', response.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));
      }),
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  activateAccount(data: ActivateAccountRequest): Observable<any> {
    const url = `${this.apiUrl}/verify_email/`;

    return this.http.post(url, data);
  }

  requestPassword(email: string): Observable<any> {
    const url = `${this.apiUrl}/request_password_reset/`;

    return this.http.post(url, { email });
  }

  resetPassword(data: PasswordResetConfirm): Observable<any> {
    const url = `${this.apiUrl}/reset_password/`;

    return this.http.post(url, data);
  }
}
