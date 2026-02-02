import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { EmployeeRecord } from '../../../../model/employee-record';
import { EmployeeProfileDialogComponent } from '../../../../components/modals/employee-profile-dialog/employee-profile-dialog.component';
import { EmployeeActionDialogComponent } from '../../../../components/modals/employee-action-dialog/employee-action-dialog.component';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';

interface BusinessLocation {
  id: string;
  name: string;
  atokaCode: string;
  address: string;
}

interface EmployeeListItem extends EmployeeRecord {
  workAddress: string;
}

@Component({
  selector: 'app-employees-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    PaginationComponent,
  ],
  templateUrl: './employees-list.component.html',
  styleUrl: './employees-list.component.scss',
})
export class EmployeesListComponent {
  searchTerm = '';
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20];
  locationId = '';

  locations: BusinessLocation[] = [
    {
      id: 'lekki-hq',
      name: 'Lekki Head Office',
      atokaCode: 'LA BD2738PK',
      address: '21 Admiralty Way, Lekki Phase 1, Lagos',
    },
    {
      id: 'ikeja-branch',
      name: 'Ikeja Branch',
      atokaCode: 'LA JK1147QD',
      address: '12 Obafemi Awolowo Way, Ikeja, Lagos',
    },
    {
      id: 'abuja-branch',
      name: 'Abuja Branch',
      atokaCode: 'FC AB2094RT',
      address: '14 Atbara Street, Wuse 2, Abuja',
    },
  ];

  employees: EmployeeListItem[] = [
    {
      id: 'emp-1',
      fullName: 'Efe Okon',
      email: 'efe.okon@example.com',
      requestDate: '2025-01-03T10:24:00Z',
      locationId: 'lekki-hq',
      status: 'Confirmed',
      gender: 'Female',
      phoneNumber: '0801 234 5678',
      employmentLength: '2 years',
      employmentStartDate: '2023-01-09T00:00:00Z',
      state: 'Lagos',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '21 Admiralty Way, Lekki Phase 1, Lagos',
    },
    {
      id: 'emp-2',
      fullName: 'Tunde Adeyemi',
      email: 'tunde.adeyemi@example.com',
      requestDate: '2025-01-08T15:40:00Z',
      locationId: 'lekki-hq',
      status: 'Confirmed',
      gender: 'Male',
      phoneNumber: '0802 345 6789',
      employmentLength: '4 years',
      employmentStartDate: '2021-03-02T00:00:00Z',
      state: 'Lagos',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '21 Admiralty Way, Lekki Phase 1, Lagos',
    },
    {
      id: 'emp-3',
      fullName: 'Ifeoma Nwosu',
      email: 'ifeoma.nwosu@example.com',
      requestDate: '2025-01-11T08:15:00Z',
      locationId: 'lekki-hq',
      status: 'Pending',
      gender: 'Female',
      phoneNumber: '0803 987 4321',
      employmentLength: '1 year',
      employmentStartDate: '2024-02-14T00:00:00Z',
      state: 'Lagos',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '21 Admiralty Way, Lekki Phase 1, Lagos',
    },
    {
      id: 'emp-4',
      fullName: 'Samuel Lawal',
      email: 'samuel.lawal@example.com',
      requestDate: '2025-01-15T11:05:00Z',
      locationId: 'ikeja-branch',
      status: 'Confirmed',
      gender: 'Male',
      phoneNumber: '0804 221 3344',
      employmentLength: '3 years',
      employmentStartDate: '2022-01-20T00:00:00Z',
      state: 'Lagos',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '12 Obafemi Awolowo Way, Ikeja, Lagos',
    },
    {
      id: 'emp-5',
      fullName: 'Hannah Bello',
      email: 'hannah.bello@example.com',
      requestDate: '2025-01-16T09:20:00Z',
      locationId: 'ikeja-branch',
      status: 'Confirmed',
      gender: 'Female',
      phoneNumber: '0805 556 7788',
      employmentLength: '5 years',
      employmentStartDate: '2019-07-01T00:00:00Z',
      state: 'Lagos',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '12 Obafemi Awolowo Way, Ikeja, Lagos',
    },
    {
      id: 'emp-6',
      fullName: 'Chinedu Obi',
      email: 'chinedu.obi@example.com',
      requestDate: '2025-01-18T13:10:00Z',
      locationId: 'ikeja-branch',
      status: 'Removed',
      gender: 'Male',
      phoneNumber: '0806 778 9900',
      employmentLength: '2 years',
      employmentStartDate: '2023-05-10T00:00:00Z',
      state: 'Lagos',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '12 Obafemi Awolowo Way, Ikeja, Lagos',
    },
    {
      id: 'emp-7',
      fullName: 'Bola Yusuf',
      email: 'bola.yusuf@example.com',
      requestDate: '2025-01-20T07:55:00Z',
      locationId: 'abuja-branch',
      status: 'Confirmed',
      gender: 'Female',
      phoneNumber: '0807 112 2233',
      employmentLength: '3 years',
      employmentStartDate: '2022-04-18T00:00:00Z',
      state: 'FCT',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '14 Atbara Street, Wuse 2, Abuja',
    },
    {
      id: 'emp-8',
      fullName: 'Uche James',
      email: 'uche.james@example.com',
      requestDate: '2025-01-21T16:05:00Z',
      locationId: 'abuja-branch',
      status: 'Pending',
      gender: 'Male',
      phoneNumber: '0808 334 4455',
      employmentLength: '1 year',
      employmentStartDate: '2024-06-01T00:00:00Z',
      state: 'FCT',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '14 Atbara Street, Wuse 2, Abuja',
    },
    {
      id: 'emp-9',
      fullName: 'Zainab Sule',
      email: 'zainab.sule@example.com',
      requestDate: '2025-01-24T12:15:00Z',
      locationId: 'lekki-hq',
      status: 'Confirmed',
      gender: 'Female',
      phoneNumber: '0809 221 3344',
      employmentLength: '3 years',
      employmentStartDate: '2022-08-05T00:00:00Z',
      state: 'Lagos',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '21 Admiralty Way, Lekki Phase 1, Lagos',
    },
    {
      id: 'emp-10',
      fullName: 'Kola Ajayi',
      email: 'kola.ajayi@example.com',
      requestDate: '2025-01-26T09:35:00Z',
      locationId: 'ikeja-branch',
      status: 'Confirmed',
      gender: 'Male',
      phoneNumber: '0810 445 6677',
      employmentLength: '6 years',
      employmentStartDate: '2018-02-10T00:00:00Z',
      state: 'Lagos',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '12 Obafemi Awolowo Way, Ikeja, Lagos',
    },
    {
      id: 'emp-11',
      fullName: 'Adaeze Okafo',
      email: 'adaeze.okafo@example.com',
      requestDate: '2025-01-27T14:30:00Z',
      locationId: 'abuja-branch',
      status: 'Confirmed',
      gender: 'Female',
      phoneNumber: '0811 556 7788',
      employmentLength: '2 years',
      employmentStartDate: '2023-03-11T00:00:00Z',
      state: 'FCT',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '14 Atbara Street, Wuse 2, Abuja',
    },
    {
      id: 'emp-12',
      fullName: 'Yusuf Ali',
      email: 'yusuf.ali@example.com',
      requestDate: '2025-01-28T17:20:00Z',
      locationId: 'lekki-hq',
      status: 'Pending',
      gender: 'Male',
      phoneNumber: '0812 667 8899',
      employmentLength: '9 months',
      employmentStartDate: '2024-04-20T00:00:00Z',
      state: 'Lagos',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '21 Admiralty Way, Lekki Phase 1, Lagos',
    },
    {
      id: 'emp-13',
      fullName: 'Adaeze Eke',
      email: 'adaeze.eke@example.com',
      requestDate: '2025-01-29T09:12:00Z',
      locationId: 'lekki-hq',
      status: 'Confirmed',
      gender: 'Female',
      phoneNumber: '0813 445 7788',
      employmentLength: '2 years',
      employmentStartDate: '2023-01-25T00:00:00Z',
      state: 'Lagos',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '21 Admiralty Way, Lekki Phase 1, Lagos',
    },
    {
      id: 'emp-14',
      fullName: 'Olamide Bankole',
      email: 'olamide.bankole@example.com',
      requestDate: '2025-01-30T14:40:00Z',
      locationId: 'lekki-hq',
      status: 'Confirmed',
      gender: 'Male',
      phoneNumber: '0814 556 8899',
      employmentLength: '4 years',
      employmentStartDate: '2020-11-02T00:00:00Z',
      state: 'Lagos',
      avatarUrl: 'assets/images/avatar-1.png',
      workAddress: '21 Admiralty Way, Lekki Phase 1, Lagos',
    },
  ];

  constructor(private router: Router, private route: ActivatedRoute, private dialog: MatDialog) {
    this.route.queryParamMap.subscribe((params) => {
      this.locationId = params.get('locationId') || '';
      this.pageIndex = 0;
    });
  }

  get filteredEmployees(): EmployeeListItem[] {
    const term = this.searchTerm.trim().toLowerCase();
    let filtered = this.employees;

    if (this.locationId) {
      filtered = filtered.filter((employee) => employee.locationId === this.locationId);
    }

    if (term) {
      filtered = filtered.filter((employee) => {
        const name = employee.fullName.toLowerCase();
        const email = employee.email.toLowerCase();
        const address = employee.workAddress.toLowerCase();
        const status = employee.status.toLowerCase();

        return (
          name.includes(term) ||
          email.includes(term) ||
          address.includes(term) ||
          status.includes(term)
        );
      });
    }

    return filtered;
  }

  get paginatedEmployees(): EmployeeListItem[] {
    const startIndex = this.pageIndex * this.pageSize;
    return this.filteredEmployees.slice(startIndex, startIndex + this.pageSize);
  }

  onSearchChange(): void {
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  goBack(): void {
    this.router.navigateByUrl('/app/business-account/employees');
  }

  openProfile(employee: EmployeeRecord): void {
    this.dialog.open(EmployeeProfileDialogComponent, {
      maxHeight: '90vh',
      panelClass: 'employee-profile-dialog',
      data: employee,
    });
  }

  requestRemoval(employee: EmployeeRecord): void {
    this.dialog.open(EmployeeActionDialogComponent, {
      maxHeight: '90vh',
      data: {
        employee,
        message: 'Are you sure you want to remove this employee from your business?',
        confirmText: 'Remove employee',
        cancelText: 'Cancel request',
        iconType: 'warning',
        requiresReason: true,
      },
    });
  }

  getStatusClass(status: EmployeeRecord['status']): string {
    switch (status) {
      case 'Confirmed':
        return 'successful';
      case 'Pending':
        return 'pending';
      case 'Removed':
        return 'failed';
      default:
        return 'draft';
    }
  }
}
