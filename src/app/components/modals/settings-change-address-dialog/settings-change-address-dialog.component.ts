import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs';
import { AddressFormComponent } from '../../address-form/address-form.component';
import { AtokaSearchComponent } from '../../atoka-search/atoka-search.component';

@Component({
  selector: 'app-settings-change-address-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    AtokaSearchComponent,
    AddressFormComponent,
  ],
  templateUrl: './settings-change-address-dialog.component.html',
  styleUrl: './settings-change-address-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SettingsChangeAddressDialogComponent {
  @ViewChild(AddressFormComponent) addressFormComponent?: AddressFormComponent;

  addressCode?: string;
  manualEntry = false;
  message = '';
  isSavingAddress = false;
  isSuccess = false;

  constructor(private dialogRef: MatDialogRef<SettingsChangeAddressDialogComponent>) {}

  close(): void {
    this.dialogRef.close({ status: 'cancel' });
  }

  setAddressCode(value: string): void {
    this.addressCode = value;
    this.manualEntry = false;
  }

  toggleManualEntry(): void {
    this.manualEntry = !this.manualEntry;
  }

  handleFormMessage(message: string): void {
    this.message = message;
    this.isSavingAddress = false;
  }

  submit(): void {
    this.message = '';

    if (this.isSavingAddress) {
      return;
    }

    if (this.manualEntry) {
      if (!this.addressFormComponent) {
        this.message = 'Address form is unavailable. Please try again.';
        return;
      }

      this.isSavingAddress = true;
      this.addressFormComponent.showFormState
        .pipe(take(1))
        .subscribe({
          next: (code: string) => {
            this.isSavingAddress = false;
            this.addressCode = code;
            this.isSuccess = true;
          },
          error: () => {
            this.isSavingAddress = false;
            this.message = 'An error occurred while saving the address. Please try again.';
          },
        });

      this.addressFormComponent.save();
      return;
    }

    if (!this.addressCode) {
      this.message = 'Please select an ATOKA address or enter one manually.';
      return;
    }

    this.isSuccess = true;
  }

  finish(): void {
    this.dialogRef.close({ status: 'success', data: { addressCode: this.addressCode } });
  }
}
