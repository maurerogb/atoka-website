import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { UserComponent } from './user.component';

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
        component: UserComponent,
      },
    ],
  },
];
