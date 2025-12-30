import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { BusinessAccountDashboardComponent } from './business-account-dashboard.component';

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
        component: BusinessAccountDashboardComponent,
      },
    ],
  },
];

