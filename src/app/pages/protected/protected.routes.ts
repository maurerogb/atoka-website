import { Routes } from '@angular/router';
import { ProtectedShellComponent } from './protected-shell.component';

export const protectedRoutes: Routes = [
  {
    path: '',
    component: ProtectedShellComponent,
    children: [
      // Future protected routes go here
    ],
  },
];
