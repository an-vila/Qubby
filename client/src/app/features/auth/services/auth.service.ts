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
  // Devuelve un Observable<void> porque no esperamos datos de vuelta, solo saber si funcionó o falló
  register(data: RegisterRequest): Observable<void> {
    console.log('REGISTER → backend', data); 
    // 'of()' crea una respuesta inmediata y exitosa. 
    // Finge que el backend respondió "OK" al instante.
    return of(); 
  }

  // --- 2. ACTIVACIÓN DE CUENTA ---
  // Este método lo usa tu ActivatePageComponent
  activateAccount(token: string): Observable<void> {
    console.log('ACTIVATE → backend token:', token);
    // Simula que el token se envió y se validó correctamente.
    return of();
  }

  // --- 3. INICIO DE SESIÓN (LOGIN) ---
  // Recibe email y contraseña. Devuelve la respuesta con el Token y el Usuario.
  login(data: LoginRequest): Observable<AuthResponse> {
    console.log('LOGIN → backend', data);

    // --- MOCK (SIMULACIÓN) ---
    // En lugar de llamar a http.post(...), devolvemos datos falsos fijos.
    // Esto es muy útil para probar que tu diseño de Login funciona
    // sin necesitar que Spring Boot esté encendido.
    return of({
      token: 'fake-jwt-token', // Un token inventado
      user: {
        id: '1',
        email: data.email, // Devolvemos el mismo email que escribió el usuario
        activated: true    // Simulamos que el usuario ya activó su cuenta
      }
    });
  }

  // --- 4. VERIFICACIÓN DE SEGURIDAD ---
  // Comprueba si hay un token guardado en el navegador.
  // Devuelve true si estás logueado, false si no.
  isAuthenticated(): boolean {
    // convierte el resultado en booleano (true/false)
    return !!localStorage.getItem('token');

    //cuando este el backend
    // return this.http.post('/auth/login', data);
  }
}