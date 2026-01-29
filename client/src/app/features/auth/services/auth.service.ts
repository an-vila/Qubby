import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { RegisterRequest } from '../models/register-request.model';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse } from '../models/auth-response.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8000/api/auth'

  constructor() {}

  register(data: RegisterRequest): Observable<void> {
    console.log('REGISTER → backend', data);
    
    // CORRECCIÓN IMPORTANTE:
    // Ponemos 'undefined' para que emita un valor y el componente sepa que ha terminado.
    // Si pones 'of()' vacío, el .subscribe() nunca recibe el aviso y el botón se queda cargando.
    return of(undefined);
  }

  activateAccount(token: string): Observable<void> {
    console.log('ACTIVATE → backend token:', token);
    
    // CORRECCIÓN IMPORTANTE:
    // Igual aquí. Devolvemos 'undefined' para simular un éxito inmediato (HTTP 200 OK).
    return of(undefined);
  }

  // --- 3. INICIO DE SESIÓN (LOGIN) ---
  // Recibe email y contraseña. Devuelve la respuesta con el Token y el Usuario.
  login(data: LoginRequest): Observable<AuthResponse> {
    console.log('LOGIN → backend', data);

    // Creamos la respuesta simulada (Mock)
    const mockResponse: AuthResponse = {
      token: 'fake-jwt-token-secret-123', // Un token inventado
      user: {
        id: '1',
        email: data.email, // Devolvemos el mismo email que escribió el usuario
        activated: true    // Simulamos que el usuario ya activó su cuenta
      }
    };

    // --- NUEVO: GUARDAR SESIÓN (PERSISTENCIA) ---
    // Guardamos el token en el navegador para que no se pierda al recargar la página (F5).
    localStorage.setItem('token', mockResponse.token);
    // Opcional: guardamos también los datos del usuario por si queremos mostrar su nombre luego
    localStorage.setItem('user', JSON.stringify(mockResponse.user));

    return of(mockResponse);
  }

  requestPassword(email: string): Observable<any> {
    const url = `${this.apiUrl}/reset_password`;

    return this.http.post(url, { email });
  }

  newPassword(data: PasswordResetConfirm) : Observable<any> {
    const url = `${this.apiUrl}/reset_password_confirm`;
    return this.http.post(url, data);
  }

  // logout(): void {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('user');
  // }

  // --- 5. VERIFICACIÓN DE SEGURIDAD ---
  // Comprueba si hay un token guardado en el navegador.
  // Devuelve TRUE si existe (estás logueado) o FALSE si no.
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}