import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { EmployeeRecord } from '../../../model/employee-record';

export interface EmployeeActionDialogData {
  employee: EmployeeRecord;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  iconType?: 'success' | 'warning';
  requiresReason?: boolean;
}

@Component({
  selector: 'app-employee-action-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './employee-action-dialog.component.html',
  styleUrl: './employee-action-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EmployeeActionDialogComponent {
  reasonControl = new FormControl('', this.data.requiresReason ? Validators.required : []);

  constructor(
    private dialogRef: MatDialogRef<EmployeeActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmployeeActionDialogData,
  ) {}

  cancel(): void {
    this.dialogRef.close({ status: 'cancel' });
  }

  confirm(): void {
    if (this.data.requiresReason && this.reasonControl.invalid) {
      this.reasonControl.markAsTouched();
      return;
    }

    this.dialogRef.close({
      status: 'confirmed',
      reason: this.reasonControl.value,
    });
  }

  get iconAsset(): string {
    return this.data.iconType === 'success' ? 'assets/images/accept-icon.svg' : 'assets/images/reject-icon.svg';
  }
}
