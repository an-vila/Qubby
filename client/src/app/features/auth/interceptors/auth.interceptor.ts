import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const token = authService.getAccessToken;

  if (token) {
    console.log('Interceptor: Adjuntando token a la petición:', req.url);
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  console.warn('Interceptor: No hay token para la petición:', req.url);
  return next(req);
};