import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs';
import { AddressFormComponent } from '../../address-form/address-form.component';
import { AtokaSearchComponent } from '../../atoka-search/atoka-search.component';
import { Address, AddressInfo } from '../../../model/atoka-query';

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
  addressSelection?: AddressInfo;
  selectedAddressInfo?: Address;
  showAddressForm = false;
  isAddressFormReadOnly = false;
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
    if (this.addressSelection?.atokaCode !== value) {
      this.addressSelection = undefined;
      this.selectedAddressInfo = undefined;
      this.showAddressForm = false;
      this.isAddressFormReadOnly = false;
    }
    this.manualEntry = false;
  }

  setAddressInfo(value: Address | undefined): void {
    if (!value?.atoka || !value?.atokaAddressId) {
      this.addressSelection = undefined;
      this.selectedAddressInfo = undefined;
      this.showAddressForm = false;
      this.isAddressFormReadOnly = false;
      return;
    }

    this.addressSelection = {
      atokaCode: value.atoka,
      atokaAddressId: value.atokaAddressId,
    };
    this.selectedAddressInfo = value;
    this.addressCode = value.atoka;
    this.showAddressForm = true;
    this.isAddressFormReadOnly = true;
    this.manualEntry = false;
  }

  toggleManualEntry(): void {
    this.manualEntry = true;
    this.showAddressForm = true;
    this.isAddressFormReadOnly = false;
    this.addressCode = '';
    this.addressSelection = undefined;
    this.selectedAddressInfo = undefined;
    this.addressFormComponent?.resetForm();
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
          next: (savedAddress: AddressInfo) => {
            this.isSavingAddress = false;
            this.addressSelection = savedAddress;
            this.addressCode = savedAddress.atokaCode;
            this.selectedAddressInfo = undefined;
            this.showAddressForm = false;
            this.isAddressFormReadOnly = false;
            this.manualEntry = false;
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

    if (!this.addressCode || !this.addressSelection?.atokaAddressId) {
      this.message = 'Please select an ATOKA address or enter one manually.';
      return;
    }

    this.isSuccess = true;
  }

  finish(): void {
    this.dialogRef.close({
      status: 'success',
      data: {
        addressCode: this.addressCode,
        atokaAddressId: this.addressSelection?.atokaAddressId,
      },
    });
  }
}

