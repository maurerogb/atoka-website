import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/public/public.routes').then(
        (m) => m.publicRoutes
      ),
  },
  {
    path: 'protected',
    loadChildren: () =>
      import('./pages/protected/protected.routes').then(
        (m) => m.protectedRoutes
      ),
  },
];
