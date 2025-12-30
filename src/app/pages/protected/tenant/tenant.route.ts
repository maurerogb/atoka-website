import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { TenantComponent } from './tenant.component';

export const TENANT_ROUTES: Routes = [
  {
    path: '',
    component: AccountShellComponent,
    data: {
      accountType: 'tenant',
      title: 'Tenant',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: TenantComponent,
      },
    ],
  },
];
