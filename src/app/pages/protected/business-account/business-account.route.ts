import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { BusinessDashboardComponent } from './business-dashboard/business-dashboard.component';
import { IncidentComponent } from '../shared/incident/incident.component';

export const BUSINESS_ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    component: AccountShellComponent,
    data: {
      accountType: 'business-account',
      title: 'Business Account',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: BusinessDashboardComponent,
      },
      {
        path: 'incident',
        component: IncidentComponent,
      }
    ],
  },
];
