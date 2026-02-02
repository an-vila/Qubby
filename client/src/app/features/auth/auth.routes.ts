import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';

// Configuración de rutas para el módulo de Autenticación de Qubby
export const authRoutes: Routes = [
  {
    // Ruta principal del módulo (ej: /auth)
    path: '',
    // El Layout actúa como contenedor para el fondo y logo en todas las sub-páginas
    component: AuthLayoutComponent,
    children: [
      {
        // Ruta para iniciar sesión: /auth/login
        path: 'login',
        // Carga el componente solo cuando el usuario entra en esta URL (Lazy Loading)
        loadComponent: () =>
          import('./pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
      },
      {
        // Ruta para registrar nuevos usuarios: /auth/register
        path: 'register',
        // Mantiene la aplicación ligera cargando el código bajo demanda
        loadComponent: () =>
          import('./pages/register-page/register-page.component').then(
            (m) => m.RegisterPageComponent,
          ),
      },
      {
        // RUTA para activar la cuenta mediante el token del correo: /auth/activate
        path: 'activate',
        // Carga de forma diferida el componente de activación que acabamos de limpiar
        loadComponent: () =>
          import('./pages/active-page/activate-page.component').then(
            (m) => m.ActivatePageComponent,
          ),
      },
      {
        // RUTA para activar la cuenta mediante el token del correo: /auth/activate
        path: 'recovery',
        // Carga de forma diferida el componente de activación que acabamos de limpiar
        loadComponent: () =>
          import('./pages/recovery-page/recovery-page.component').then(
            (m) => m.RecoveryPageComponent,
          ),
      },
      {
        // RUTA para activar la cuenta mediante el token del correo: /auth/activate
        path: 'reset',
        // Carga de forma diferida el componente de activación que acabamos de limpiar
        loadComponent: () =>
          import('./pages/reset-password-page/reset-password-page.component').then(
            (m) => m.ResetPasswordPageComponent,
          ),
      },
      {
        // Si el usuario entra a /auth sin nada más, lo mandamos al login por defecto
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];


