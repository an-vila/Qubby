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
   * Crea una nueva cuenta de usuario
   */
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/`, data);
  }

  /**
   * LOGIN: POST /api/users/login/
   * 
   * Respuesta:
   * {
   *   "message": "Inicio de sesión exitoso",
   *   "user": {...},
   *   "tokens": {
   *     "access": "eyJ0eXAi...",
   *     "refresh": "eyJ0eXAi..."
   *   }
   * }
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

  /**
   * Obtener token de acceso guardado
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Obtener token de refresh
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Obtener usuario guardado
   */
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * LOGOUT: Eliminar tokens y datos del usuario
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
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
}
