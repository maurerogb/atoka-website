import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AtokaSearchService } from '../../services/atoka-search.service';
import { EmployeeService } from '../../services/employee.service';
import { SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ButtonComponent } from '../../shared/button/button.component';
import { EmployeeDetailsComponent } from '../modals/employee-details/employee-details.component';
import { RemoveEmployeeComponent } from '../modals/remove-employee/remove-employee.component';
import { RejectEmployeeComponent } from '../modals/reject-employee/reject-employee.component';
import { Employee } from '../../model/employee-record';

@Component({
  selector: 'app-request-card',
  standalone: true,

  imports: [MatSelectModule, ButtonComponent, MatMenuModule, CommonModule],
  templateUrl: './request-card.component.html',
  styleUrl: './request-card.component.scss'
})
export class RequestCardComponent implements OnInit {
  @Input() confirmStatus?: string
  @Input() details?: Employee;
  employeeForm?: FormGroup
  constructor(private matDialog: MatDialog,
    private employeeService: EmployeeService,
    private router: Router, private atokaServ: AtokaSearchService,
    private settingService: SettingsService, private fb: FormBuilder
  ) {

  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // this.employeeForm = this.fb.group({
    //   surname: this.details?.surname,
    //   firstName: this.details?.firstName,
    //   middleName: this.details?.middleName,
    //   title: this.details?.title,
    //   gender: this.details?.gender,
    //   dateOfBirth: this.details?.dateOfBirth,
    //   phoneNumber: this.details?.phoneNumber,
    //   ocupation: this.details?.ocupation,
    //   imageUrl: this.details?.imageUrl,
    //   emailAddress: this.details?.emailAddress,
    //   placeOfWorkId: this.details?.placeOfWorkId,
    //   employmentStartDate: this.details?.employmentStartDate,
    //   confirmationStatus: this.details?.confirmationStatus,
    // })

  }

  employeeDetails() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxHeight = '90vh';
    let dialogRef = this.matDialog.open(
      EmployeeDetailsComponent, { data: this.details }

    );
  }
  removeEmployee() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxHeight = '90vh';
    let dialogRef = this.matDialog.open(
      RemoveEmployeeComponent,
      dialogConfig
    );
  }
  rejectEmployee() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.maxHeight = '90vh';
    let dialogRef = this.matDialog.open(
      RejectEmployeeComponent,
      dialogConfig
    );
  }

}
