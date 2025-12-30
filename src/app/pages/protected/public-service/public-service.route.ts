import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { PublicServiceComponent } from './public-service.component';

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
        component: PublicServiceComponent,
      },
    ],
  },
];
