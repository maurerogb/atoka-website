import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/public/public.routes').then(
        (m) => m.publicRoutes
      ),
  },
  {
    path: 'app',
    canMatch: [authGuard],
    loadChildren: () =>
      import('./pages/protected/protected.routes').then(
        (m) => m.protectedRoutes
      ),
  },
];
