import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => 
      import('./features/auth/auth.routes').then(m => m.authRoutes)
  },

  {
    path: 'home',
    loadComponent: () => 
      import('./features/home/pages/home-page/home-page.component').then(m => m.HomePageComponent)
  },
  {
    path: 'box/:id', 
    loadComponent: () => 
      import('./features/home/pages/box-detail-page/box-detail-page.component').then(m => m.BoxDetailPageComponent)
  },
  {
    path: 'box/:id/add', 
    loadComponent: () => 
      import('./features/home/pages/add-object-page/add-object-page.component').then(m => m.AddObjectPageComponent)
  },
 
  {
    path: 'box/:id/scan', 
    loadComponent: () => 
      import('./features/home/pages/qr-scan-page/qr-scan-page.component').then(m => m.QrScanPageComponent)
  },

  {
    path: '',
    redirectTo: 'home', 
    pathMatch: 'full'
  },
  
  {
    path: '**',
    redirectTo: 'home' 
  }
];