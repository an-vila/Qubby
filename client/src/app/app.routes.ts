import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => 
      import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  {
    path: 'home',
    loadComponent: () => 
      import('./features/home/pages/home-page/home-page.component').then(m => m.HomePageComponent),
    canActivate: [authGuard] 
  },
  {
    path: 'box/:id', 
    loadComponent: () => 
      import('./features/home/pages/box-detail-page/box-detail-page.component').then(m => m.BoxDetailPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'box/:id/add', 
    loadComponent: () => 
      import('./features/home/pages/add-object-page/add-object-page.component').then(m => m.AddObjectPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'box/:id/qr', 
    loadComponent: () => 
      import('./features/home/pages/qr-page/qr-page.component').then(m => m.QrPageComponent),
    canActivate: [authGuard] 
  },

  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];