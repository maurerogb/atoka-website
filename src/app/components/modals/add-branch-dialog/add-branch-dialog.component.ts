import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { take } from 'rxjs';
import { AtokaSearchComponent } from '../../atoka-search/atoka-search.component';
import { AddressFormComponent } from '../../address-form/address-form.component';
import { BranchService } from '../../../services/branch.service';
import { LoadingService } from '../../../services/loading.service';
import { ResponseCode } from '../../../model/enums';
import { LoaderComponent } from '../../loader/loader.component';
import { BusinessService } from '../../../services/business.service';
import { Address, AddressInfo } from '../../../model/atoka-query';
import { AuthenticationService } from '../../../services/authentication.service';
import { AtokaSearchService } from '../../../services/atoka-search.service';

@Component({
  selector: 'app-add-branch-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    AtokaSearchComponent,
    AddressFormComponent,
    LoaderComponent,
  ],
  templateUrl: './add-branch-dialog.component.html',
  styleUrl: './add-branch-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class AddBranchDialogComponent {
  @ViewChild(AddressFormComponent) addressFormComponent?: AddressFormComponent;

  branchForm: FormGroup;
  message = '';
  isSubmitting = false;
  isSavingAddress = false;
  hideForm = false;
  addressCode?: string;
  addressSelection?: AddressInfo;
  selectedAddressInfo?: Address;
  isAddressFormReadOnly = false;
  manualAddressMode = false;
  addressResult: any;
  businessId?: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddBranchDialogComponent>,
    private branchService: BranchService,
    private businessService: BusinessService,
    private authService: AuthenticationService,
    private atokaSearchService: AtokaSearchService,
    public loadingService: LoadingService,
  ) {
    this.branchForm = this.fb.group({
      branchName: ['', Validators.required],
      confirmOwnership: [false, Validators.requiredTrue],
    });

    this.branchForm = this.fb.group({
      businessInfoId: [0, Validators.required],
      residentDetailId: [0, Validators.required],
      isHQ: [false, Validators.required],
      branchName: ['', Validators.required],
      confirmOwnership: [false, Validators.required],
    });
  }

  ngOnInit(): void {
    // this.createFilterForm();
    this.businessId = this.authService.getLoginInfo()?.businessId;
  }

  close(): void {
    this.dialogRef.close({ status: 'cancel' });
  }

  setAddressCode(value: string): void {
    this.addressCode = value;
    if (this.addressSelection?.atokaCode !== value) {
      this.addressSelection = undefined;
      this.selectedAddressInfo = undefined;
      this.isAddressFormReadOnly = false;
      this.hideForm = false;
    }
    this.manualAddressMode = false;
  }

  setAddressInfo(value: Address | undefined): void {
    if (!value?.atoka || !value?.atokaAddressId) {
      this.addressSelection = undefined;
      this.selectedAddressInfo = undefined;
      this.isAddressFormReadOnly = false;
      this.hideForm = false;
      return;
    }

    this.addressSelection = {
      atokaCode: value.atoka,
      atokaAddressId: value.atokaAddressId,
      residentDetailId: value.residentDetailId,
    };
    this.selectedAddressInfo = value;
    this.addressCode = value.atoka;
    this.manualAddressMode = false;
    this.isAddressFormReadOnly = true;
    this.hideForm = true;
  }

  setHideForm(value: AddressInfo): void {
    this.addressCode = value.atokaCode;
    this.addressSelection = value;
    this.selectedAddressInfo = undefined;
    this.manualAddressMode = false;
    this.isAddressFormReadOnly = false;
    this.hideForm = false;
  }

  showForm(): void {
    this.message = '';
    this.manualAddressMode = true;
    this.isAddressFormReadOnly = false;
    this.hideForm = true;
    this.addressCode = '';
    this.addressSelection = undefined;
    this.selectedAddressInfo = undefined;
    this.addressFormComponent?.resetForm();
  }

  submit(): void {
    this.message = '';

    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      this.message = 'Please complete the branch form before continuing.';
      return;
    }

    if (this.isSubmitting || this.isSavingAddress) {
      return;
    }

    if (this.addressCode && !this.manualAddressMode) {
      this.createBranch(this.addressCode, this.addressSelection?.atokaAddressId);
      return;
    }

    if (this.manualAddressMode && this.hideForm) {
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
            this.manualAddressMode = false;
            this.isAddressFormReadOnly = false;
            this.createBranch(savedAddress.atokaCode, savedAddress.atokaAddressId);
          },
          error: () => {
            this.isSavingAddress = false;
            this.message = 'An error occurred while saving the address. Please try again.';
          },
        });

      this.addressFormComponent.save();
      return;
    }

    this.message = 'Please select or enter an address before continuing.';
  }

  private createBranch(atokaCode: string, atokaAddressId?: number): void {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.atokaSearchService.searchAtoka(atokaCode).subscribe({
      next: (res) => {
        if (res.responseCode !== ResponseCode.Success) {
          this.isSubmitting = false;
          this.message = res.description || 'Unable to resolve address details.';
          return;
        }

        const address = Array.isArray(res.data) ? res.data[0] : res.data;
        const residentDetailId = address?.residentDetailId;
        const resolvedAtokaAddressId = atokaAddressId ?? address?.atokaAddressId;
        this.branchForm.get('residentDetailId')?.patchValue(residentDetailId);

        const payload = {
          ...this.branchForm.value,
          branchName: this.branchForm.value.branchName?.trim(),
          atokaCode,
          atokaAddressId: resolvedAtokaAddressId,
          confirmOwnership: !!this.branchForm.value.confirmOwnership,
          businessInfoId: this.businessId,
          residentDetailId,
        };

        // this.branchService.createBranch(payload).subscribe({
        this.branchService.addBusinessBranch(payload).subscribe({
          next: (branchRes) => {
            this.isSubmitting = false;
            if (branchRes.responseCode === ResponseCode.Success) {
              this.dialogRef.close({
                status: 'success',
                data: payload,
              });
            } else {
              this.message = branchRes.description || 'Unable to add branch.';
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            this.message =
              err?.error?.description ||
              err?.description ||
              'An error occurred. Please try again.';
          },
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.message = 'Unable to resolve address details. Please try again.';
      },
    });
  }
}

