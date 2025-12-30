import { Routes } from '@angular/router';
import { landingRoutes } from './landing/landing.routes';

export const publicRoutes: Routes = [
  {
    path: '',
    children: landingRoutes,
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'logout',
    loadComponent: () =>
      import('./auth/logout/logout.component').then((m) => m.LogoutComponent),
  },
  {
    path: 'register',
    loadChildren: () => import('./auth/register/registration.route').then(m => m.REGISTRATION_ROUTES)
  }
];
