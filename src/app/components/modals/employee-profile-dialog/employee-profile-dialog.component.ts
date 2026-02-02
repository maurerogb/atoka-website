import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Employee } from '../../../model/employee-record';
import { EmploymentLengthPipe } from '../../../shared/pipes/employment-length.pipe';

@Component({
  selector: 'app-employee-profile-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, EmploymentLengthPipe],
  templateUrl: './employee-profile-dialog.component.html',
  styleUrl: './employee-profile-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EmployeeProfileDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<EmployeeProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Employee,
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  get statusClass(): string {
    switch (this.data.status) {
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

  public fullname(employee: Employee): string {
    return (
      employee.firstName +
      ' ' +
      (employee.middleName ? employee.middleName + ' ' : '') +
      employee.surname
    );
  }
}
