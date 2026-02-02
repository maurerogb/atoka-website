import { Routes } from '@angular/router';
import { AccountShellComponent } from '../account-shell/account-shell.component';
import { BusinessDashboardComponent } from './business-dashboard/business-dashboard.component';
import { IncidentComponent } from '../shared/incident/incident.component';
import { AddressVerificationComponent } from '../shared/address-verification/address-verification.component';
import { EmployeesComponent } from './employees/employees.component';
import { EmployeesListComponent } from './employees-list/employees-list.component';
import { BranchComponent } from './branch/branch.component';

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
      },
      {
        path: 'address-verification',
        component: AddressVerificationComponent,
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
    ],
  },
];
