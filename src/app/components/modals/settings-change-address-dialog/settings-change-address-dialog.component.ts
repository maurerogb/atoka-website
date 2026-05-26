import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { take } from 'rxjs';
import { BaseResponse } from '../../../model/base-response';
import { Address, AddressInfo, MoveInDate, ResidenceStartedWebResponse } from '../../../model/atoka-query';
import { ResponseCode } from '../../../model/enums';
import { LoadingService } from '../../../services/loading.service';
import { RegistrationService } from '../../../services/registration.service';
import { AddressFormComponent } from '../../address-form/address-form.component';
import { AtokaSearchComponent } from '../../atoka-search/atoka-search.component';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
  selector: 'app-settings-change-address-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    AtokaSearchComponent,
    AddressFormComponent,
    LoaderComponent,
  ],
  templateUrl: './settings-change-address-dialog.component.html',
  styleUrl: './settings-change-address-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SettingsChangeAddressDialogComponent {
  @ViewChild(AddressFormComponent) addressFormComponent?: AddressFormComponent;
  @Output() addressUpdated = new EventEmitter<{ addressCode?: string; atokaAddressId?: number }>();

  moveInForm: FormGroup;
  addressCode?: string;
  addressSelection?: AddressInfo;
  selectedAddressInfo?: Address;
  showAddressForm = false;
  isAddressFormReadOnly = false;
  manualEntry = false;
  message = '';
  isSavingAddress = false;
  isSuccess = false;

  constructor(
    private dialogRef: MatDialogRef<SettingsChangeAddressDialogComponent>,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    public loadingService: LoadingService
  ) {
    this.moveInForm = this.fb.group({
      startFrom: ['', Validators.required],
    });
  }

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
      residentDetailId: value.residentDetailId,
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

    if (this.moveInForm.invalid) {
      this.moveInForm.markAllAsTouched();
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
            this.saveMoveInDate();
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

    this.saveMoveInDate();
  }

  finish(): void {
    this.dialogRef.close({ status: 'success', data: this.getAddressUpdatePayload() });
  }

  private saveMoveInDate(): void {
    const moveInPayload = this.buildMoveInPayload();
    if (!moveInPayload) {
      return;
    }

    this.isSavingAddress = true;
    this.loadingService.show();

    this.registrationService.movedInOn(moveInPayload).subscribe({
      next: (res: BaseResponse<ResidenceStartedWebResponse>) => {
        this.isSavingAddress = false;
        this.loadingService.hide();

        if (res.responseCode === ResponseCode.Success) {
          this.addressUpdated.emit(this.getAddressUpdatePayload());
          this.isSuccess = true;
          return;
        }

        this.message = res.description || 'Unable to save your address. Please try again.';
      },
      error: (err: any) => {
        this.isSavingAddress = false;
        this.loadingService.hide();
        this.message =
          err?.error?.description ||
          err?.description ||
          'An error occurred while saving your address. Please try again.';
      },
    });
  }

  private buildMoveInPayload(): MoveInDate | null {
    const residentDetailId = this.addressSelection?.residentDetailId;
    const atokaAddressId = residentDetailId || this.addressSelection?.atokaAddressId;

    if (!atokaAddressId) {
      this.message = 'Please select a valid ATOKA address before continuing.';
      return null;
    }

    return {
      startFrom: this.moveInForm.value.startFrom,
      atokaAddressId,
    };
  }

  private getAddressUpdatePayload(): { addressCode?: string; atokaAddressId?: number } {
    return {
      addressCode: this.addressCode,
      atokaAddressId: this.addressSelection?.atokaAddressId,
    };
  }
}
