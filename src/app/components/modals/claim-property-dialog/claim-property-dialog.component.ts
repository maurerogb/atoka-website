import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { take } from 'rxjs';
import { AddressFormComponent } from '../../address-form/address-form.component';
import { AtokaSearchComponent } from '../../atoka-search/atoka-search.component';
import { LoaderComponent } from '../../loader/loader.component';
import { UploadFileComponent } from '../../upload-file/upload-file.component';
import { Address, AddressInfo } from '../../../model/atoka-query';
import { ResponseCode } from '../../../model/enums';
import { ClaimPropertyRequest, DocumentType } from '../../../model/tenant';
import { AtokaSearchService } from '../../../services/atoka-search.service';
import { LoadingService } from '../../../services/loading.service';
import { TenantService } from '../../../services/tenant.service';
import { ToastService } from '../../../services/toast.service';

interface SelectOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-claim-property-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    AtokaSearchComponent,
    AddressFormComponent,
    UploadFileComponent,
    LoaderComponent,
  ],
  templateUrl: './claim-property-dialog.component.html',
  styleUrl: './claim-property-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ClaimPropertyDialogComponent {
  @ViewChild(AddressFormComponent) addressFormComponent?: AddressFormComponent;

  claimForm: FormGroup;
  message = '';
  hideForm = false;
  addressCode?: string;
  addressSelection?: AddressInfo;
  selectedAddress?: Address;
  isAddressFormReadOnly = false;
  manualAddressMode = false;
  uploadedDocument?: File;
  isSubmitting = false;
  isSavingAddress = false;
  submitted = false;
  documentTypeOptions: DocumentType[] = [];

  readonly ownerManagerOptions: SelectOption[] = [
    { label: 'Landlord', value: 'landlord' },
    { label: 'Agent/letting agent', value: 'agent/letting agent' },
    { label: 'Caretaker', value: 'caretaker' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ClaimPropertyDialogComponent>,
    private atokaSearchService: AtokaSearchService,
    private tenantService: TenantService,
    private toastService: ToastService,
    public loadingService: LoadingService,
  ) {
    this.claimForm = this.fb.group({
      ownerManager: ['', Validators.required],
      documentTypeId: ['', Validators.required],
      documentRefNo: ['', Validators.required],
      verifyOwnership: [false],
    });
  }

  ngOnInit(): void {
    this.loadDocumentTypes();
  }

  close(): void {
    this.dialogRef.close({ status: 'cancel' });
  }

  setAddressCode(value: string): void {
    this.addressCode = value;
    if (this.addressSelection?.atokaCode !== value) {
      this.addressSelection = undefined;
      this.selectedAddress = undefined;
      this.isAddressFormReadOnly = false;
      this.hideForm = false;
    }
    this.manualAddressMode = false;
  }

  setAddressInfo(value: Address | undefined): void {
    if (!value?.atoka || !value?.atokaAddressId) {
      this.addressSelection = undefined;
      this.selectedAddress = undefined;
      this.isAddressFormReadOnly = false;
      this.hideForm = false;
      return;
    }

    this.selectedAddress = value;
    this.addressSelection = {
      atokaCode: value.atoka,
      atokaAddressId: value.atokaAddressId,
    };
    this.addressCode = value.atoka;
    this.manualAddressMode = false;
    this.isAddressFormReadOnly = true;
    this.hideForm = true;
  }

  setHideForm(value: AddressInfo): void {
    this.addressCode = value.atokaCode;
    this.addressSelection = value;
    this.selectedAddress = undefined;
    this.manualAddressMode = false;
    this.isAddressFormReadOnly = false;
    this.hideForm = false;
  }

  showForm(): void {
    this.manualAddressMode = true;
    this.isAddressFormReadOnly = false;
    this.hideForm = true;
    this.addressCode = undefined;
    this.addressSelection = undefined;
    this.selectedAddress = undefined;
    this.message = '';
    this.addressFormComponent?.resetForm();
  }

  setDocument(value: File): void {
    this.uploadedDocument = value;
  }

  get showUploadError(): boolean {
    return this.submitted && !this.uploadedDocument;
  }

  get canSubmit(): boolean {
    if (this.claimForm.invalid || !this.uploadedDocument || this.isSubmitting || this.isSavingAddress) {
      return false;
    }

    const hasSelectedAddress = Boolean(this.addressCode && !this.manualAddressMode);
    const hasManualAddress = this.manualAddressMode && this.hideForm;
    return hasSelectedAddress || hasManualAddress;
  }

  submit(): void {
    this.submitted = true;
    this.message = '';

    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      this.message = 'Please complete the claim form before continuing.';
      return;
    }

    if (!this.uploadedDocument) {
      this.message = 'Upload document is required.';
      return;
    }

    if (this.isSubmitting || this.isSavingAddress) {
      return;
    }

    if (this.addressCode && !this.manualAddressMode) {
      this.createClaim(this.addressCode, this.addressSelection?.atokaAddressId);
      return;
    }

    if (this.manualAddressMode && this.hideForm) {
      this.saveAddressAndClaim();
      return;
    }

    this.message = 'Please select or enter a property address before continuing.';
  }

  private saveAddressAndClaim(): void {
    if (!this.addressFormComponent) {
      this.message = 'Address form is unavailable. Please try again.';
      return;
    }

    this.isSavingAddress = true;
    this.addressFormComponent.showFormState.pipe(take(1)).subscribe({
      next: (savedAddress: AddressInfo) => {
        this.isSavingAddress = false;
        this.addressCode = savedAddress.atokaCode;
        this.addressSelection = savedAddress;
        this.createClaim(savedAddress.atokaCode, savedAddress.atokaAddressId);
      },
      error: () => {
        this.isSavingAddress = false;
        this.message = 'An error occurred while saving the address. Please try again.';
      },
    });

    this.addressFormComponent.save();
  }

  private createClaim(atokaCode: string, atokaAddressId?: number): void {
    if (this.isSubmitting || !this.uploadedDocument) {
      return;
    }

    this.isSubmitting = true;
    this.atokaSearchService.searchAtoka(atokaCode).subscribe({
      next: (res) => {
        if (res.responseCode !== ResponseCode.Success) {
          this.isSubmitting = false;
          this.message = res.description || 'Unable to resolve property address.';
          return;
        }

        const resolvedAddress = Array.isArray(res.data) ? res.data[0] : undefined;
        const resolvedAtokaAddressId = atokaAddressId ?? resolvedAddress?.atokaAddressId;
        if (!resolvedAtokaAddressId) {
          this.isSubmitting = false;
          this.message = 'Unable to resolve property address id.';
          return;
        }
        const payload = this.buildClaimPayload(
          atokaCode,
          resolvedAtokaAddressId,
          resolvedAddress,
        );

        this.tenantService.claimProperty(payload).subscribe({
          next: (res) => {
            this.isSubmitting = false;
            if (res.responseCode === ResponseCode.Success) {
              this.dialogRef.close({
                status: 'success',
                atokaCode,
              });
            } else {              
              this.toastService.show(undefined, res.description || 'Unable to submit claim request.', 'error');
              this.message = res.description || 'Unable to submit claim request.';
            }
          },
          error: (err) => {
            this.isSubmitting = false;
            this.message =
              err?.error?.description ||
              err?.description ||
              'An error occurred while submitting your request.';
            this.toastService.show(undefined, this.message, 'error');
          },
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.message = 'Unable to resolve property address. Please try again.';
      },
    });
  }

  private loadDocumentTypes(): void {
    this.tenantService.getDocumentTypes().subscribe({
      next: (res) => {
        if (res.responseCode === ResponseCode.Success && Array.isArray(res.data)) {
          this.documentTypeOptions = res.data;

          return;
        }

        this.documentTypeOptions = [];
      },
      error: () => {
        this.documentTypeOptions = [];
      },
    });
  }

  private buildClaimPayload(
    atokaCode: string,
    atokaAddressId: number,
    address?: Address,
  ): ClaimPropertyRequest {
    return {
      atokaCode,
      atokaAddressId,
      houseNo: address?.oldNumber ?? address?.atokaNumber ?? '',
      documentTypeId: Number(this.claimForm.value.documentTypeId),
      fileExtention: this.getFileExtension(this.uploadedDocument?.name ?? ''),
      documentRefNo: String(this.claimForm.value.documentRefNo ?? '').trim(),
    };
  }

  private getFileExtension(fileName: string): string {
    const extensionIndex = fileName.lastIndexOf('.');
    if (extensionIndex < 0 || extensionIndex === fileName.length - 1) {
      return '';
    }

    return fileName.slice(extensionIndex + 1).toLowerCase();
  }
}
