import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EmployeeActionDialogComponent } from '../../../../components/modals/employee-action-dialog/employee-action-dialog.component';
import { EmployeeProfileDialogComponent } from '../../../../components/modals/employee-profile-dialog/employee-profile-dialog.component';
import { AddBranchDialogComponent } from '../../../../components/modals/add-branch-dialog/add-branch-dialog.component';
import { Employee } from '../../../../model/employee-record';
import { ToastNotificationComponent } from '../../../../shared/toast-notification/toast-notification.component';
import { EmployeeService } from '../../../../services/employee.service';
import { SettingsService } from '../../../../services/settings.service';
import { ButtonComponent } from "../../../../shared/button/button.component";
import { Address } from '../../../../model/atoka-query';
import { ResponseCode } from '../../../../model/enums';
import { AtokaSearchComponent } from "../../../../components/atoka-search/atoka-search.component";
import { AddressCardComponent } from "../../../../components/address-card/address-card.component";
import { RequestCardComponent } from "../../../../components/request-card/request-card.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatMenuModule,
    MatSnackBarModule,
    ButtonComponent,
    AtokaSearchComponent,
    AddressCardComponent,
    RequestCardComponent,
    MatAutocompleteModule,
    MatInputModule
],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss'
})
export class EmployeesComponent {
  userId: any
  selected = false;
  employees: any;
  seeMore = false;
  details: any;
  // approvedEmployee:  Employee[] = [];
  // pendingEmployee:  Employee[] = [];
  allByBusiness: any;
  addressInfo?: Address;

  locations: Address[] = [
    {
      atoka: "LA AB1883KY",
      atokaAddressId: 1,
      atokaNumber: "13",
      chargable: true,
      cityName: "Ikoyi\r\n",
      countries: "Nigeria",
      countryCode: "NGN",
      countryCurrency: "NGN",
      districtName: "",
      drainageType:"Closed",
      electricDistribution: "Surface",
      houseName: "abc",
      latitude: "3.25689",
      lga: "Eti Osa",
      longitude: "6.5235255",
      mast: "None",
      oldNumber: "13",
      parkingType: "free",
      residentDetailId: 32,
      roadTypeName: "Awe ",
      stateName: "Lagos",
      streetLight: "No", 
      streetName: "Alimosho Road"
    }
  ];

  // employees: EmployeeRecord[] = [
  //   {
  //     id: 'emp-1',
  //     fullName: 'Efe Okon',
  //     email: 'efe.okon@example.com',
  //     requestDate: '2025-01-03T10:24:00Z',
  //     locationId: 'lekki-hq',
  //     status: 'Confirmed',
  //     gender: 'Female',
  //     phoneNumber: '0801 234 5678',
  //     employmentLength: '2 years',
  //     employmentStartDate: '2023-01-09T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'emp-2',
  //     fullName: 'Tunde Adeyemi',
  //     email: 'tunde.adeyemi@example.com',
  //     requestDate: '2025-01-08T15:40:00Z',
  //     locationId: 'lekki-hq',
  //     status: 'Confirmed',
  //     gender: 'Male',
  //     phoneNumber: '0802 345 6789',
  //     employmentLength: '4 years',
  //     employmentStartDate: '2021-03-02T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'emp-3',
  //     fullName: 'Ifeoma Nwosu',
  //     email: 'ifeoma.nwosu@example.com',
  //     requestDate: '2025-01-11T08:15:00Z',
  //     locationId: 'lekki-hq',
  //     status: 'Confirmed',
  //     gender: 'Female',
  //     phoneNumber: '0803 987 4321',
  //     employmentLength: '1 year',
  //     employmentStartDate: '2024-02-14T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'emp-9',
  //     fullName: 'Zainab Sule',
  //     email: 'zainab.sule@example.com',
  //     requestDate: '2025-01-24T12:15:00Z',
  //     locationId: 'lekki-hq',
  //     status: 'Confirmed',
  //     gender: 'Female',
  //     phoneNumber: '0809 221 3344',
  //     employmentLength: '3 years',
  //     employmentStartDate: '2022-08-05T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'emp-12',
  //     fullName: 'Yusuf Ali',
  //     email: 'yusuf.ali@example.com',
  //     requestDate: '2025-01-28T17:20:00Z',
  //     locationId: 'lekki-hq',
  //     status: 'Confirmed',
  //     gender: 'Male',
  //     phoneNumber: '0812 667 8899',
  //     employmentLength: '9 months',
  //     employmentStartDate: '2024-04-20T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'emp-13',
  //     fullName: 'Adaeze Eke',
  //     email: 'adaeze.eke@example.com',
  //     requestDate: '2025-01-29T09:12:00Z',
  //     locationId: 'lekki-hq',
  //     status: 'Confirmed',
  //     gender: 'Female',
  //     phoneNumber: '0813 445 7788',
  //     employmentLength: '2 years',
  //     employmentStartDate: '2023-01-25T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'emp-14',
  //     fullName: 'Olamide Bankole',
  //     email: 'olamide.bankole@example.com',
  //     requestDate: '2025-01-30T14:40:00Z',
  //     locationId: 'lekki-hq',
  //     status: 'Confirmed',
  //     gender: 'Male',
  //     phoneNumber: '0814 556 8899',
  //     employmentLength: '4 years',
  //     employmentStartDate: '2020-11-02T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'emp-4',
  //     fullName: 'Samuel Lawal',
  //     email: 'samuel.lawal@example.com',
  //     requestDate: '2025-01-15T11:05:00Z',
  //     locationId: 'ikeja-branch',
  //     status: 'Confirmed',
  //     gender: 'Male',
  //     phoneNumber: '0804 221 3344',
  //     employmentLength: '3 years',
  //     employmentStartDate: '2022-01-20T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'emp-5',
  //     fullName: 'Hannah Bello',
  //     email: 'hannah.bello@example.com',
  //     requestDate: '2025-01-16T09:20:00Z',
  //     locationId: 'ikeja-branch',
  //     status: 'Confirmed',
  //     gender: 'Female',
  //     phoneNumber: '0805 556 7788',
  //     employmentLength: '5 years',
  //     employmentStartDate: '2019-07-01T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'emp-6',
  //     fullName: 'Chinedu Obi',
  //     email: 'chinedu.obi@example.com',
  //     requestDate: '2025-01-18T13:10:00Z',
  //     locationId: 'ikeja-branch',
  //     status: 'Confirmed',
  //     gender: 'Male',
  //     phoneNumber: '0806 778 9900',
  //     employmentLength: '2 years',
  //     employmentStartDate: '2023-05-10T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'emp-7',
  //     fullName: 'Bola Yusuf',
  //     email: 'bola.yusuf@example.com',
  //     requestDate: '2025-01-20T07:55:00Z',
  //     locationId: 'abuja-branch',
  //     status: 'Confirmed',
  //     gender: 'Female',
  //     phoneNumber: '0807 112 2233',
  //     employmentLength: '3 years',
  //     employmentStartDate: '2022-04-18T00:00:00Z',
  //     state: 'FCT',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'emp-8',
  //     fullName: 'Uche James',
  //     email: 'uche.james@example.com',
  //     requestDate: '2025-01-21T16:05:00Z',
  //     locationId: 'abuja-branch',
  //     status: 'Confirmed',
  //     gender: 'Male',
  //     phoneNumber: '0808 334 4455',
  //     employmentLength: '1 year',
  //     employmentStartDate: '2024-06-01T00:00:00Z',
  //     state: 'FCT',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  // ];

  // pendingRequests: EmployeeRecord[] = [
  //   {
  //     id: 'req-1',
  //     fullName: 'Mariam Yusuf',
  //     email: 'mariam.yusuf@example.com',
  //     requestDate: '2025-01-22T14:30:00Z',
  //     locationId: 'lekki-hq',
  //     status: 'Pending',
  //     gender: 'Female',
  //     phoneNumber: '0810 111 2233',
  //     employmentLength: '6 months',
  //     employmentStartDate: '2024-07-15T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'req-2',
  //     fullName: 'Ibrahim Musa',
  //     email: 'ibrahim.musa@example.com',
  //     requestDate: '2025-01-23T09:05:00Z',
  //     locationId: 'lekki-hq',
  //     status: 'Pending',
  //     gender: 'Male',
  //     phoneNumber: '0811 222 3344',
  //     employmentLength: '1 year',
  //     employmentStartDate: '2024-01-10T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'req-3',
  //     fullName: 'Sade Ogun',
  //     email: 'sade.ogun@example.com',
  //     requestDate: '2025-01-24T12:45:00Z',
  //     locationId: 'ikeja-branch',
  //     status: 'Pending',
  //     gender: 'Female',
  //     phoneNumber: '0812 333 4455',
  //     employmentLength: '8 months',
  //     employmentStartDate: '2024-05-18T00:00:00Z',
  //     state: 'Lagos',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  //   {
  //     id: 'req-4',
  //     fullName: 'Peter Okafor',
  //     email: 'peter.okafor@example.com',
  //     requestDate: '2025-01-25T10:20:00Z',
  //     locationId: 'abuja-branch',
  //     status: 'Pending',
  //     gender: 'Male',
  //     phoneNumber: '0813 444 5566',
  //     employmentLength: '3 months',
  //     employmentStartDate: '2024-10-01T00:00:00Z',
  //     state: 'FCT',
  //     avatarUrl: 'assets/images/avatar-1.png',
  //   },
  // ];

  pendingRequests: Employee[] = [
    {
      id: 'req-1',
      firstName: 'Mariam',
      surname: 'Yusuf',
      // fullName: 'Mariam Yusuf',
      emailAddress: 'mariam.yusuf@example.com',
      // requestDate: '2025-01-22T14:30:00Z',
      // locationId: 'lekki-hq',
      status: 'PENDING',
      gender: 'Female',
      phoneNumber: '0810 111 2233',
      // employmentLength: '6 months',
      employmentStartDate: '2024-07-15T00:00:00Z',
      // state: 'Lagos',
      // avatarUrl: 'assets/images/avatar-1.png',
      occupantDetailId: 1,
      middleName: '',
      title: '',
      dateOfBirth: '',
      ocupation: '',
      imageUrl: 'assets/images/avatar-1.png',
      placeOfWorkId: 1,
      contactPerson: '',
      businessPhoneNo: '',
      businessId: 1,
      branchId: 1,
      isCurrentJob: false,
      confirmationStatus: 'Pending',
      approvedOn: '2025-01-22T14:30:00Z',
      approvedBy: ''
    },
  ]

  approvedEmployee: Employee[] = [
    {
      id: 'req-1',
      firstName: 'Mariam',
      surname: 'Yusuf',
      // fullName: 'Mariam Yusuf',
      emailAddress: 'mariam.yusuf@example.com',
      // requestDate: '2025-01-22T14:30:00Z',
      // locationId: 'lekki-hq',
      status: 'Pending',
      gender: 'Female',
      phoneNumber: '0810 111 2233',
      // employmentLength: '6 months',
      employmentStartDate: '2024-07-15T00:00:00Z',
      // state: 'Lagos',
      // avatarUrl: 'assets/images/avatar-1.png',
      occupantDetailId: 1,
      middleName: '',
      title: '',
      dateOfBirth: '',
      ocupation: '',
      imageUrl: 'assets/images/avatar-1.png',
      placeOfWorkId: 1,
      contactPerson: '',
      businessPhoneNo: '',
      businessId: 1,
      branchId: 1,
      isCurrentJob: false,
      confirmationStatus: 'Confirmed',
      approvedOn: '2025-01-22T14:30:00Z',
      approvedBy: ''
    },
    {
      id: 'req-1',
      firstName: 'Mariam',
      surname: 'Yusuf',
      // fullName: 'Mariam Yusuf',
      emailAddress: 'mariam.yusuf@example.com',
      // requestDate: '2025-01-22T14:30:00Z',
      // locationId: 'lekki-hq',
      status: 'Pending',
      gender: 'Female',
      phoneNumber: '0810 111 2233',
      // employmentLength: '6 months',
      employmentStartDate: '2024-07-15T00:00:00Z',
      // state: 'Lagos',
      // avatarUrl: 'assets/images/avatar-1.png',
      occupantDetailId: 1,
      middleName: '',
      title: '',
      dateOfBirth: '',
      ocupation: '',
      imageUrl: 'assets/images/avatar-1.png',
      placeOfWorkId: 1,
      contactPerson: '',
      businessPhoneNo: '',
      businessId: 1,
      branchId: 1,
      isCurrentJob: false,
      confirmationStatus: 'Confirmed',
      approvedOn: '2025-01-22T14:30:00Z',
      approvedBy: ''
    },
  ]

  activeEmployee?: Employee;
  initialEmployeesToShow = 6;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private employeeService: EmployeeService,
    private settingService: SettingsService
  ) {}

  get selectedLocation(): Address | undefined {
    return this.addressInfo;
  }

  get selectedLocationAddress(): string | undefined {
    if (!this.addressInfo) {
      return '';
    }

    const streetLine = [
      this.addressInfo.houseName,
      this.addressInfo.oldNumber,
      this.addressInfo.atokaNumber,
      this.addressInfo.streetName,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    const parts = [streetLine, this.addressInfo.cityName, this.addressInfo.stateName, this.addressInfo.countries].filter(
      Boolean,
    );
    return parts.join(', ');
  }

  // get selectedLocation(): BusinessLocation | undefined {
  //   return this.locations.find((location) => location.id === this.selectedLocationId);
  // }

  get activeEmployees(): Employee[] {
    // return this.employees.filter(
    //   (employee) => employee.locationId === this.selectedLocationId && employee.status === 'Confirmed',
    // );

    return []
  }

  get activeRequests(): Employee[] {
    return this.pendingRequests.filter(
      (request) => request.confirmationStatus === 'PENDING',
    );
  }

  get displayedEmployees(): Employee[] {
    return this.approvedEmployee.slice(0, this.initialEmployeesToShow);
  }

  onLocationChange(value: string): void {
    // this.selectedLocationId = locationId;
    this.addressInfo = this.locations?.find(a => a.atoka == value)
  }

  goToEmployeesList(): void {
    this.router.navigate(['/app/business-account/employees/list'], {
      queryParams: {
        // locationId: this.selectedLocationId || null,
      },
    });

    //this.router.navigateByUrl('/app/business-account/employee-list')
  }

  setActiveEmployee(employee: Employee): void {
    this.activeEmployee = employee;
  }

  openAddBranch(): void { //AddBranchComponent
    const dialogRef = this.dialog.open(AddBranchDialogComponent, {
      maxHeight: '90vh',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'success') {
        this.showToast('Add Branch', 'Your request is pending review, we will notify you once we have verified your address');
      }
    });
  }

  openEmployeeProfile(employee: Employee): void {
    this.dialog.open(EmployeeProfileDialogComponent, {
      maxHeight: '90vh',
      panelClass: 'employee-profile-dialog',
      data: employee,
    });
  }

  openRemoveEmployee(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeActionDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      data: {
        employee,
        title: 'Remove Employee',
        message: 'Are you sure you want to remove this employee from your business?',
        confirmText: 'Remove employee',
        cancelText: 'Cancel request',
        iconType: 'warning',
        requiresReason: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'confirmed') {
        // this.employees = this.employees.filter((item) => item.id !== employee.id);
        this.showToast(undefined, `you have successfully sent a delete request for "${this.fullname(employee)}"`);
      }
    });
  }

  openApproveRequest(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeActionDialogComponent, {
      maxHeight: '90vh',
      data: {
        employee,
        title: 'Approve Employee',
        message: 'Are you sure you want to approve this employee for your business',
        confirmText: 'Approve employee',
        cancelText: 'Cancel request',
        iconType: 'success',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'confirmed') {
        this.pendingRequests = this.pendingRequests.filter((item) => item.id !== employee.id);
        this.employees = [
          ...this.employees,
          {
            ...employee,
            status: 'Confirmed',
            requestDate: new Date().toISOString(),
          },
        ];
        this.showToast(undefined, `you have successfully added "${this.fullname(employee)}" to your employees list`);
      }
    });
  }

  openRejectRequest(employee: Employee): void {
    const dialogRef = this.dialog.open(EmployeeActionDialogComponent, {
      autoFocus: false,
      maxHeight: '90vh',
      data: {
        employee,
        title: 'Reject Employee',
        message: 'Are you sure you want to reject this employee for your business?',
        confirmText: 'Reject request',
        cancelText: 'Cancel request',
        iconType: 'warning',
        requiresReason: true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.status === 'confirmed') {
        this.pendingRequests = this.pendingRequests.filter((item) => item.id !== employee.id);
      }
    });
  }

  public fullname(employee: Employee): string {
    return (
      employee.firstName +
      ' ' +
      (employee.middleName ? employee.middleName + ' ' : '') +
      employee.surname
    );
  }

  private showToast(title: string | undefined, message: string): void {
    this.snackBar.openFromComponent(ToastNotificationComponent, {
      data: {
        title,
        message,
      },
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['atoka-toast-panel'],
    });
  }






  // starting here
  ngOnInit(): void {
    this.getUserDetails();
    this.getallNotAppprovedEmployees();
    this.getAllAppprovedEmployees();
  }

  getAddress(value: Address) {
    this.addressInfo = value;
  }

  getAllAppprovedEmployees(): void {
    this.employeeService.getAllApprovedColleagues().subscribe(res => {
      if (res.responseCode == ResponseCode.Success) {
        this.approvedEmployee = res.data
      }
    })
  }

  getallNotAppprovedEmployees(): void {
    this.employeeService.getAllNotApprovedColleagues().subscribe(res => {
      if (res.responseCode == ResponseCode.Success) {
        this.pendingRequests = res.data
      }
    })
  }

  getAllByBusiness(): void {
    this.employeeService.getAllByBusinesses().subscribe(res => {
      if (res.responseCode == ResponseCode.Success) {
        this.allByBusiness = res.data
      }
    })
  }

  selectedAddress() {
    this.selected = !this.selected
  }
  
  employeeDetails() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxHeight = '90vh';
    dialogConfig.panelClass = 'employee-profile-dialog';
    let dialogRef = this.dialog.open(
      EmployeeProfileDialogComponent, //EmployeeDetailsComponent,
      dialogConfig
    );
  }
  addEmployee() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxHeight = '90vh';
    dialogConfig.panelClass = 'employee-profile-dialog';
    let dialogRef = this.dialog.open(
      EmployeeProfileDialogComponent, //AddEmployeeModalComponent,
      dialogConfig
    );
  }
    // AddressSearchComponent
  removeEmployee() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxHeight = '90vh';
    let dialogRef = this.dialog.open(
      EmployeeActionDialogComponent, //RemoveEmployeeComponent,
      dialogConfig
    );
  }
  rejectEmployee() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxHeight = '90vh';
    let dialogRef = this.dialog.open(
      EmployeeActionDialogComponent, //RejectEmployeeComponent,
      dialogConfig
    );
  }

  // getAllEmployees() {
  //   this.employeeService.getAllEmployees(this.userId).subscribe((res: any) => {
  //     if (this.seeMore) {
  //       this.employees = res.data
  //     } else {
  //       this.employees = res.data.slice(0, 4);
  //     }
  //   })
  // }

  getUserDetails() {
    this.settingService.getUserDetails(this.userId).subscribe((res: any) => {
      this.details = res.data
    })
  }
}
