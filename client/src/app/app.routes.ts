import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes')
        .then(m => m.authRoutes)
  },


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