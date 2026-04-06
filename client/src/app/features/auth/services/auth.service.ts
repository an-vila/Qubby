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
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}users`;

  constructor(private router: Router) {}

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
        localStorage.clear();
        sessionStorage.clear();

        const storage = data.rememberMe ? localStorage : sessionStorage;

        storage.setItem('access_token', response.tokens.access);
        storage.setItem('refresh_token', response.tokens.refresh);
        storage.setItem('user', JSON.stringify(response.user));
      }),
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('user');
  }

  getUser(): any {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.clear();

    this.router.navigate(['/auth/login']).then(() => {
      window.location.reload();
    });
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

  updateProfile(data: { name: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/profile/`, data);
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change_password/`, data);
  }
}
