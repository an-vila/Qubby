import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
// 👇 AJUSTE DE RUTA: Subimos un nivel (..) para salir de 'guards' y entrar en 'services'
import { AuthService } from '../services/auth.service';

// Definimos el Guard como una función de tipo 'CanActivateFn'
// Esta función recibe la ruta a la que se quiere ir y devuelve SI (true) o NO (false)
export const authGuard: CanActivateFn = (route, state) => {
  
  // 1. Inyección de dependencias (versión moderna de Angular)
  // En lugar de constructor, usamos 'inject()' porque esto es una función, no una clase.
  const authService = inject(AuthService); // Necesitamos al servicio para preguntar si hay token
  const router = inject(Router);           // Necesitamos al router para redirigir si no hay permiso

  // 2. Comprobación de seguridad
  // Llamamos a tu método que revisa si existe el token en localStorage
  if (authService.isAuthenticated()) {
    // ✅ ACCESO CONCEDIDO
    // El usuario tiene token, así que le dejamos pasar a la página (/home)
    return true;
  } else {
    // ⛔ ACCESO DENEGADO
    // El usuario no tiene token (o lo borró).
    console.log('🔒 Guard: Bloqueado por falta de token. Redirigiendo al login...');
    
    // Lo enviamos de vuelta a la casilla de salida
    router.navigate(['/auth/login']);
    
    // Devolvemos false para cancelar la navegación actual
    return false;
  }
};