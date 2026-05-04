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

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, data).pipe(
      tap((response: any) => {
        this.clearStorage();

        const storage = data.rememberMe ? localStorage : sessionStorage;

        storage.setItem('access_token', response.tokens.access);
        storage.setItem('refresh_token', response.tokens.refresh);
        storage.setItem('user', JSON.stringify(response.user));
      }),
    );
  }

  private clearStorage(): void {
    ['access_token', 'refresh_token', 'user'].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  private getStorage(): Storage | null {
    const local = localStorage.getItem('access_token');
    if (local && local !== 'null' && local !== 'undefined') return localStorage;

    const session = sessionStorage.getItem('access_token');
    if (session && session !== 'null' && session !== 'undefined') return sessionStorage;

    return null;
  }

  getAccessToken(): string | null {
    return this.getStorage()?.getItem('access_token') || null;
  }

  getRefreshToken(): string | null {
    return this.getStorage()?.getItem('refresh_token') || null;
  }

  getUser(): any {
    const user = this.getStorage()?.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();

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
