import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export type AddressVerificationRequestAction = 'approve' | 'reject';

@Component({
  selector: 'app-address-verification-request-action-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './address-verification-request-action-dialog.component.html',
  styleUrl: './address-verification-request-action-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AddressVerificationRequestActionDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<AddressVerificationRequestActionDialogComponent>,
  ) {}

  approve(): void {
    this.dialogRef.close('approve' as AddressVerificationRequestAction);
  }

  reject(): void {
    this.dialogRef.close('reject' as AddressVerificationRequestAction);
  }

  close(): void {
    this.dialogRef.close();
  }
}
