import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { PublicServiceDashboardComponent } from './public-service-dashboard/public-service-dashboard.component';
import { IncidentComponent } from '../shared/incident/incident.component';

export const PUBLIC_SERVICE_ROUTES: Routes = [
  {
    path: '',
    component: AccountShellComponent,
    data: {
      accountType: 'public-service',
      title: 'Public Service',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PublicServiceDashboardComponent,
      },
      {
        path: 'incident',
        component: IncidentComponent,
      },
    ],
  },
];
