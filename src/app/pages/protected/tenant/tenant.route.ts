import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { TenantDashboardComponent } from './tenant-dashboard/tenant-dashboard.component';
import { IncidentComponent } from '../shared/incident/incident.component';

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
        component: TenantDashboardComponent,
      },
      {
        path: 'incident',
        component: IncidentComponent,
      },
    ],
  },
];
