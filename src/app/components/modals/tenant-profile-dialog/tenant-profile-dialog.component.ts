import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmploymentLengthPipe } from '../../../shared/pipes/employment-length.pipe';
import { TenantPerson } from '../../../model/tenant';

@Component({
  selector: 'app-tenant-profile-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, EmploymentLengthPipe],
  templateUrl: './tenant-profile-dialog.component.html',
  styleUrl: './tenant-profile-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TenantProfileDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<TenantProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TenantPerson,
  ) {}

  close(): void {
    this.dialogRef.close();
  }

  get statusLabel(): string {
    const status = this.data.status || this.data.confirmationStatus || 'PENDING';
    return this.toTitleCase(status);
  }

  get statusClass(): string {
    const status = (this.data.status || this.data.confirmationStatus || '').toUpperCase();

    switch (status) {
      case 'CONFIRMED':
      case 'APPROVED':
      case 'APROVED':
        return 'successful';
      case 'REMOVED':
      case 'REJECTED':
        return 'failed';
      case 'PENDING':
        return 'pending';
      default:
        return 'draft';
    }
  }

  get startDate(): string {
    const value = this.data.startFrom ?? this.data.createdOn;
    return value || '';
  }

  fullname(): string {
    const names = [this.data.firstName, this.data.middleName, this.data.surname]
      .filter((value) => Boolean(value && value.trim()))
      .map((value) => String(value).trim());

    return names.join(' ') || 'N/A';
  }

  private toTitleCase(value: string): string {
    const normalized = value.replace(/_/g, ' ').trim();
    if (!normalized) {
      return 'N/A';
    }

    return normalized
      .toLowerCase()
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
