import { Routes } from '@angular/router';
// 1. Importamos el Guard (asegúrate de que la ruta coincida con tu carpeta)
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  // --- RUTA PÚBLICA (Login, Registro, etc.) ---
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.authRoutes)
  },

  // --- RUTA PROTEGIDA (Home / Dashboard) ---
  // Aquí es donde añadimos la magia del Guard 🛡️
  {
    path: 'home',
    // Carga perezosa (Lazy loading) del componente Home
    loadComponent: () => 
  import('./features/home/pages/home-page/home-page.component')
        .then(m => m.HomePageComponent),
    // Si no tienes token, el authGuard te bloqueará y te enviará al login
    canActivate: [authGuard]
  },

  // --- RUTA PROTEGIDA (Detalle de caja → ver items) ---
  {
    path: 'home/box/:id',
    loadComponent: () =>
      import('./features/home/pages/box-detail-page/box-detail-page.component')
        .then(m => m.BoxDetailPageComponent),
    canActivate: [authGuard]
  },
  // --- REDIRECCIÓN POR DEFECTO ---
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  
  // (Opcional) Ruta comodín por si escriben algo raro (404)
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];