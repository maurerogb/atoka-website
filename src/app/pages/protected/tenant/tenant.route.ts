import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { TenantDashboardComponent } from './tenant-dashboard/tenant-dashboard.component';
import { IncidentComponent } from '../shared/incident/incident.component';
import { LocationComponent } from '../shared/location/location.component';
import { AddressVerificationComponent } from '../shared/address-verification/address-verification.component';
import { AddressVerificationRequestViewComponent } from '../shared/address-verification-request-view/address-verification-request-view.component';
import { AddressVerificationRequestsComponent } from '../shared/address-verification-requests/address-verification-requests.component';
import { SettingsComponent } from '../shared/settings/settings.component';
import { NotificationsComponent } from '../shared/notifications/notifications.component';
import { TenantComponent } from './tenant/tenant.component';
import { TenantListComponent } from './tenant-list/tenant-list.component';

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
        path: 'location',
        component: LocationComponent,
      },
      {
        path: 'incident',
        component: IncidentComponent,
      },
      {
        path: 'tenant',
        component: TenantComponent,
      },
      {
        path: 'tenant/list',
        component: TenantListComponent,
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
