import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { IncidentComponent } from '../shared/incident/incident.component';
import { LocationComponent } from '../shared/location/location.component';
import { AddressVerificationComponent } from '../shared/address-verification/address-verification.component';
import { AddressVerificationRequestViewComponent } from '../shared/address-verification-request-view/address-verification-request-view.component';
import { AddressVerificationRequestsComponent } from '../shared/address-verification-requests/address-verification-requests.component';
import { SettingsComponent } from '../shared/settings/settings.component';
import { NotificationsComponent } from '../shared/notifications/notifications.component';

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
        path: 'location',
        component: LocationComponent,
      },
      {
        path: 'incident',
        component: IncidentComponent,
      },
      {
        path: 'address-verification',
        component: AddressVerificationComponent,
      },
      {
        path: 'address-verification-requests',
        component: AddressVerificationRequestsComponent,
      },
      {
        path: 'address-verification-requests/:requestId',
        component: AddressVerificationRequestViewComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
      },
    ],
  },
];
