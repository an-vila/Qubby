import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';


export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/login-page/login-page.component').then((m) => m.LoginPageComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/register-page/register-page.component').then(
            (m) => m.RegisterPageComponent,
          ),
      },
      {
        path: 'activate',
        loadComponent: () =>
          import('./pages/active-page/activate-page.component').then(
            (m) => m.ActivatePageComponent,
          ),
      },
      {
        path: 'recovery',
        loadComponent: () =>
          import('./pages/recovery-page/recovery-page.component').then(
            (m) => m.RecoveryPageComponent,
          ),
      },
      {
        path: 'reset',
        loadComponent: () =>
          import('./pages/reset-password-page/reset-password-page.component').then(
            (m) => m.ResetPasswordPageComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];


