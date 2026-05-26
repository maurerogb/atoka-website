import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { BusinessDashboardComponent } from './business-dashboard/business-dashboard.component';
import { IncidentComponent } from '../shared/incident/incident.component';
import { LocationComponent } from '../shared/location/location.component';
import { AddressVerificationComponent } from '../shared/address-verification/address-verification.component';
import { AddressVerificationRequestViewComponent } from '../shared/address-verification-request-view/address-verification-request-view.component';
import { AddressVerificationRequestsComponent } from '../shared/address-verification-requests/address-verification-requests.component';
import { EmployeesComponent } from './employees/employees.component';
import { EmployeesListComponent } from './employees-list/employees-list.component';
import { BranchComponent } from './branch/branch.component';
import { SettingsComponent } from '../shared/settings/settings.component';
import { NotificationsComponent } from '../shared/notifications/notifications.component';
import { EmployeeVerificationComponent } from './employee-verification/employee-verification.component';

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
        path: 'employee-verification',
        component: EmployeeVerificationComponent,
      },
      {
        path: 'employees',
        component: EmployeesComponent,
      },
      {
        path: 'employees/list',
        component: EmployeesListComponent,
      },
      {
        path: 'branch',
        component: BranchComponent,
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
