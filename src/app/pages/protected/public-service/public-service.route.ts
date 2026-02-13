import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { PublicServiceDashboardComponent } from './public-service-dashboard/public-service-dashboard.component';
import { IncidentComponent } from '../shared/incident/incident.component';
import { AddressVerificationComponent } from '../shared/address-verification/address-verification.component';
import { SettingsComponent } from '../shared/settings/settings.component';

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
      {
        path: 'address-verification',
        component: AddressVerificationComponent,
      },
      {
        path: 'settings',
        component: SettingsComponent,
      },
    ],
  },
];
