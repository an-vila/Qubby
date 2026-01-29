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
  private apiUrl = 'http://localhost:8000/api/auth';

  constructor() {}

  register(data: RegisterRequest): Observable<any> {
    const url = `${this.apiUrl}/register/`;

    return this.http.post(url, data);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    const url = `${this.apiUrl}/login/`;

    return this.http.post<AuthResponse>(url, data).pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
      }),
    );
  }

  activateAccount(data: ActivateAccountRequest): Observable<any> {
    const url = `${this.apiUrl}/activation/`;

    return this.http.post(url, data);
  }

  requestPassword(email: string): Observable<any> {
    const url = `${this.apiUrl}/reset_password/`;

    return this.http.post(url, { email });
  }

  newPassword(data: PasswordResetConfirm): Observable<any> {
    const url = `${this.apiUrl}/reset_password_confirm/`;

    return this.http.post(url, data);
  }

  // logout(): void {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('user');
  // }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');

    return !!token;
  }
}
