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
import { Address } from '../../../model/atoka-query';
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
    this.manualAddressMode = false;
    this.hideForm = false;
  }

  setHideForm(value: string): void {
    this.addressCode = value;
    this.hideForm = false;
  }

  showForm(): void {
    this.hideForm = !this.hideForm;
    if (this.hideForm) {
      this.manualAddressMode = true;
    }
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

    if (this.addressCode && !this.hideForm) {
      this.createBranch(this.addressCode);
      return;
    }

    if (this.hideForm) {
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
            this.createBranch(code);
          },
          error: () => {
            this.isSavingAddress = false;
            this.message = 'An error occurred while saving the address. Please try again.';
          },
        });

      this.addressFormComponent.save();
      return;
    }

    if (this.addressCode) {
      this.createBranch(this.addressCode);
      return;
    }

    this.message = 'Please select or enter an address before continuing.';
  }

  private createBranch(atokaCode: string): void {
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
        this.branchForm.get('residentDetailId')?.patchValue(residentDetailId);

        const payload = {
          ...this.branchForm.value,
          branchName: this.branchForm.value.branchName?.trim(),
          atokaCode,
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
