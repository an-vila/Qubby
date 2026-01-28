import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
// Importamos los "contratos" (interfaces) que definimos antes
import { RegisterRequest } from '../models/register-request.model';
import { LoginRequest } from '../models/login-request.model';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en TODA la app (Singleton)
})
export class AuthService {

  // --- 1. REGISTRO ---
  // Recibe los datos del formulario de registro
  register(data: RegisterRequest): Observable<void> {
    console.log('REGISTER → backend', data);
    
    // CORRECCIÓN IMPORTANTE:
    // Ponemos 'undefined' para que emita un valor y el componente sepa que ha terminado.
    // Si pones 'of()' vacío, el .subscribe() nunca recibe el aviso y el botón se queda cargando.
    return of(undefined);
  }

  // --- 2. ACTIVACIÓN DE CUENTA ---
  // Este método lo usa tu ActivatePageComponent
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

  // --- 4. CERRAR SESIÓN (LOGOUT) ---
  // Este método borra los datos del navegador para "salir" de la cuenta.
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('Sesión cerrada: Token eliminado del LocalStorage');
  }

  // --- 5. VERIFICACIÓN DE SEGURIDAD ---
  // Comprueba si hay un token guardado en el navegador.
  // Devuelve TRUE si existe (estás logueado) o FALSE si no.
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}