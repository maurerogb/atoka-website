import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { take } from 'rxjs';
import { AtokaSearchComponent } from '../../../components/atoka-search/atoka-search.component';
import { AddressFormComponent } from '../../../components/address-form/address-form.component';
import { UploadFileComponent } from '../../../components/upload-file/upload-file.component';
import { LoaderComponent } from '../../../components/loader/loader.component';
import { LoadingService } from '../../../services/loading.service';
import { IncidentService } from '../../../services/incident.service';
import { ResponseCode } from '../../../model/enums';
import { ToastService } from '../../../services/toast.service';
import { IncidentPriority } from '../../../model/incident';
import { Address, AddressInfo } from '../../../model/atoka-query';

@Component({
  selector: 'app-incident-report-dialog',
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
    MatIconModule,
    AtokaSearchComponent,
    AddressFormComponent,
    UploadFileComponent,
    LoaderComponent
],
  templateUrl: './incident-report-dialog.component.html',
  styleUrl: './incident-report-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class IncidentReportDialogComponent implements OnInit {
  @ViewChild(AddressFormComponent) addressFormComponent?: AddressFormComponent;

  incidentTypes: any = [];
  incidentPriorities: IncidentPriority[] = [];
  hideForm = false;
  addressCode?: string;
  atokaAddressId?: number;
  selectedAddressInfo?: Address;
  isAddressFormReadOnly = false;
  photoFiles: File[] = [];
  message = '';
  manualAddressMode = false;
  isSubmitting = false;
  reportForm!: FormGroup;

  resolutionOptions: string[] = [ 'Federal Government' ];
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<IncidentReportDialogComponent>,
    private incidentService: IncidentService,
    private toastService: ToastService,
    public loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.getIncidentTypes();
    this.getIncidentPriorities();

    this.reportForm = this.fb.group({
      incidentTypeId: [null, Validators.required],
      incidentDetails: ['', [Validators.required]],
      resolution: ['', Validators.required],
      priority: [null, Validators.required],
      locationCode: [''],
    });
  }

  setAddressCode(value: string): void {
    this.addressCode = value;
    if (this.addressSelectionCode() !== value) {
      this.atokaAddressId = undefined;
      this.selectedAddressInfo = undefined;
      this.isAddressFormReadOnly = false;
      this.hideForm = false;
    }
    this.manualAddressMode = false;
    this.reportForm.get('locationCode')?.patchValue(value);
  }

  setAddressInfo(value: Address | undefined): void {
    if (!value?.atoka || !value?.atokaAddressId) {
      this.atokaAddressId = undefined;
      this.selectedAddressInfo = undefined;
      this.isAddressFormReadOnly = false;
      this.hideForm = false;
      return;
    }

    this.addressCode = value.atoka;
    this.atokaAddressId = value.atokaAddressId;
    this.selectedAddressInfo = value;
    this.manualAddressMode = false;
    this.isAddressFormReadOnly = true;
    this.hideForm = true;
    this.reportForm.get('locationCode')?.patchValue(value.atoka);
  }

  setHideForm(value: AddressInfo): void {
    this.addressCode = value.atokaCode;
    this.atokaAddressId = value.atokaAddressId;
    this.selectedAddressInfo = undefined;
    this.manualAddressMode = false;
    this.isAddressFormReadOnly = false;
    this.reportForm.get('locationCode')?.patchValue(value.atokaCode);
    this.hideForm = false;
  }

  showForm() {
    this.message = '';
    this.manualAddressMode = true;
    this.isAddressFormReadOnly = false;
    this.hideForm = true;
    this.addressCode = '';
    this.atokaAddressId = undefined;
    this.selectedAddressInfo = undefined;
    this.reportForm.get('locationCode')?.patchValue('');
    this.addressFormComponent?.resetForm();
  }

  setPhoto(file: File): void {
    this.photoFiles = file ? [file] : [];
  }

  close(): void {
    this.dialogRef.close({ status: 'cancel' });
  }

  getIncidentTypes() {
    this.incidentService.getIncidentTypes().subscribe(res => {
      if (res.responseCode == ResponseCode.Success) {
        this.incidentTypes = res.data
      }
    })
  }

  getIncidentPriorities() {
    this.incidentService.getIncidentPriorities().subscribe((data: IncidentPriority[]) => {
      this.incidentPriorities = data;
    });
  }

  get canSave(): boolean {
    const titleValid = this.reportForm.get('incidentTypeId')?.valid;
    const detailsValid = this.reportForm.get('incidentDetails')?.valid;
    const resolutionValid = this.reportForm.get('resolution')?.valid;
    const priorityValid = this.reportForm.get('priority')?.valid;
    const hasLocationSelection = !!this.addressCode || this.hideForm;

    return !!titleValid && !!detailsValid && !!resolutionValid && !!priorityValid && hasLocationSelection;
  }

  private submitIncident(locationCode: string, atokaAddressId?: number): void {
    if (this.isSubmitting) {
      return;
    }

    const formValue = this.reportForm.value;
    const payload = new FormData();

    payload.append('incidentDetails', formValue.incidentDetails ?? '');
    payload.append('atokaCode', locationCode);
    payload.append('isAtokaCodeKnown', String(!this.manualAddressMode));
    payload.append('longitude', '0');
    payload.append('latitude', '0');
    payload.append('incidentTypeId', String(formValue.incidentTypeId ?? 0));
    payload.append('incidentDate', new Date().toISOString());
    // to be added later
    // if (formValue.resolution) {
    //   payload.append('resolution', String(formValue.resolution));
    // }
    if (formValue.priority) {
      payload.append('priority', String(formValue.priority));
    }
    if (atokaAddressId) {
      payload.append('atokaAddressId', String(atokaAddressId));
    }

    if (this.photoFiles.length) {
      for (const file of this.photoFiles) {
        payload.append('IncidentPhotos', file, file.name);
      }
    }

    this.message = '';
    this.isSubmitting = true;

    this.incidentService.reportIncident(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.responseCode === ResponseCode.Success) {
          this.dialogRef.close({ status: 'success' });
        } else {
          this.toastService.show(undefined, res.description || 'Unable to submit incident report.', 'error');
          this.message = res.description || 'Unable to submit incident report.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err?.description) {
          this.message = err.description;
        } else if (err?.error?.description) {
          this.message = err.error.description;
        } else {
          this.message = 'An error occurred. Please try again later.';
        }
        this.toastService.show(undefined, this.message, 'error');
      },
    });
  }

  sendReport(): void {
    this.message = '';    
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    if (this.addressCode) {
      this.submitIncident(this.addressCode, this.atokaAddressId);
      return;
    }

    if (this.hideForm && this.addressFormComponent) {
      this.addressFormComponent.showFormState
        .pipe(take(1))
        .subscribe({
          next: (savedAddress: AddressInfo) => {
            this.loadingService.hide();
            this.addressCode = savedAddress.atokaCode;
            this.atokaAddressId = savedAddress.atokaAddressId;
            this.reportForm.get('locationCode')?.patchValue(savedAddress.atokaCode);
            this.submitIncident(savedAddress.atokaCode, savedAddress.atokaAddressId);
          },
          error: () => {
            this.loadingService.hide();
            this.message =
              'An error occurred while saving the address. Please try again.';
          },
        });

      this.addressFormComponent.save();
    } else {
      this.message = 'Please select or enter a location for this incident.';
    }
  }

  private addressSelectionCode(): string | undefined {
    if (!this.selectedAddressInfo?.atoka || !this.selectedAddressInfo?.atokaAddressId) {
      return undefined;
    }
    return this.selectedAddressInfo.atoka;
  }
}

