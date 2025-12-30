import { Routes } from '@angular/router';
import { ProtectedShellComponent } from './protected-shell.component';

export const protectedRoutes: Routes = [
  {
    path: '',
    component: ProtectedShellComponent,
    children: [      
      // {
      //   path: '',
      //   pathMatch: 'full',
      //   redirectTo: 'business-account',
      // },
      {
        path: 'complete-registration',
        loadChildren: () =>
          import('./complete-registration/complete-registration.route').then(
            (m) => m.COMPLETE_REGISTRATION_ROUTES,
          ),
      },
      {
        path: 'tenant',
        loadChildren: () =>
          import('./tenant/tenant.route').then((m) => m.TENANT_ROUTES),
      },
      {
        path: 'user',
        loadChildren: () =>
          import('./user/user.route').then((m) => m.USER_ROUTES),
      },
      {
        path: 'business-account',
        loadChildren: () =>
          import('./business-account/business-account.route').then(
            (m) => m.BUSINESS_ACCOUNT_ROUTES,
          ),
      },
      {
        path: 'public-service',
        loadChildren: () => import('./public-service/public-service.route').then(
            (m) => m.PUBLIC_SERVICE_ROUTES,
          ),
      },
    ],
  },
];
