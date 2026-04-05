import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => 
      import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

<<<<<<< HEAD
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./features/home/pages/home-page/home-page.component').then(m => m.HomePageComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./features/home/pages/settings-page/settings-page.component').then(m => m.SettingsPageComponent)
  },
  {
    path: 'box/:id',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./features/home/pages/box-detail-page/box-detail-page.component').then(m => m.BoxDetailPageComponent)
  },
  {
    path: 'box/:id/add',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./features/home/pages/add-object-page/add-object-page.component').then(m => m.AddObjectPageComponent)
  },
 
  {
    path: 'box/:id/scan',
    loadComponent: () => 
      import('./features/home/pages/qr-scan-page/qr-scan-page.component').then(m => m.QrScanPageComponent)
  },

=======

  {
    path: 'home',
    loadComponent: () => 
  import('./features/home/pages/home-page/home-page.component')
        .then(m => m.HomePageComponent),
    canActivate: [authGuard]
  },

  {
    path: 'home/box/:id',
    loadComponent: () =>
      import('./features/home/pages/box-detail-page/box-detail-page.component')
        .then(m => m.BoxDetailPageComponent),
    canActivate: [authGuard]
  },

>>>>>>> origin/develop
  {
    path: '',
    redirectTo: 'home', 
    pathMatch: 'full'
  },
  
<<<<<<< HEAD
=======

>>>>>>> origin/develop
  {
    path: '**',
    redirectTo: 'home' 
  }
];