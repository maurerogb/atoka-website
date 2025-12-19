import { Routes } from '@angular/router';
import { landingRoutes } from './landing/landing.routes';

export const publicRoutes: Routes = [
  {
    path: '',
    children: landingRoutes,
  },
];
