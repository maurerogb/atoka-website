import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { IncidentComponent } from '../shared/incident/incident.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: AccountShellComponent,
    data: {
      accountType: 'user',
      title: 'User',
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: UserDashboardComponent,
      },
      {
        path: 'incident',
        component: IncidentComponent,
      },
    ],
  },
];
