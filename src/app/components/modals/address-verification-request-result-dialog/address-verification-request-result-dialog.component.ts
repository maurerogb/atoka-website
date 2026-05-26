import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

type RequestOutcome = 'approved' | 'rejected';

export interface AddressVerificationRequestResultDialogData {
  outcome: RequestOutcome;
}

@Component({
  selector: 'app-address-verification-request-result-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './address-verification-request-result-dialog.component.html',
  styleUrl: './address-verification-request-result-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AddressVerificationRequestResultDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<AddressVerificationRequestResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddressVerificationRequestResultDialogData,
  ) {}

  get titleText(): string {
    return this.data.outcome === 'approved' ? 'Request Approved' : 'Request Rejected';
  }

  get messageText(): string {
    return this.data.outcome === 'approved'
      ? 'Address successfully verified. Thank you for your response.'
      : 'Request has been rejected. The requester will be notified.';
  }

  get iconAsset(): string {
    return this.data.outcome === 'approved'
      ? 'assets/images/accept-icon.svg'
      : 'assets/images/reject-icon.svg';
  }

  close(): void {
    this.dialogRef.close({ status: 'back' });
  }
}
