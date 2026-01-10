import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ButtonComponent } from "../../../shared/button/button.component";

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
    LoaderComponent,
    ButtonComponent
],
  templateUrl: './incident-report-dialog.component.html',
  styleUrl: './incident-report-dialog.component.scss',
})
export class IncidentReportDialogComponent implements OnInit {
  @ViewChild(AddressFormComponent) addressFormComponent?: AddressFormComponent;

  incidentTypes: any = [];
  hideForm = false;
  addressCode?: string;
  photoFile?: File;
  message = '';
  manualAddressMode = false;
  isSubmitting = false;
  reportForm!: FormGroup;

  resolutionOptions: string[] = [ 'Federal Government' ];
  priorityOptions: string[] = ['Low', 'Medium', 'High', 'Urgent'];


  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<IncidentReportDialogComponent>,
    private incidentService: IncidentService,
    public loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.getIncidentTypes();

    this.reportForm = this.fb.group({
      incidentTypeId: [null, Validators.required],
      incidentDetails: ['', [Validators.required]],
      resolution: ['', Validators.required],
      priority: ['Urgent'],
      locationCode: [''],
    });
  }

  setAddressCode(value: string): void {
    this.addressCode = value;
    this.manualAddressMode = false;
    this.reportForm.get('locationCode')?.patchValue(value);
  }

  setHideForm(value: string): void {
    this.addressCode = value;
    this.reportForm.get('locationCode')?.patchValue(value);
    this.hideForm = false;
  }

  showForm() {
    this.hideForm = !this.hideForm;
    if (this.hideForm) {
      this.manualAddressMode = true;
    }
  }

  setPhoto(file: File): void {
    this.photoFile = file;
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

  get canSave(): boolean {
    const titleValid = this.reportForm.get('incidentTypeId')?.valid;
    const detailsValid = this.reportForm.get('incidentDetails')?.valid;
    const resolutionValid = this.reportForm.get('resolution')?.valid;
    const priorityValid = this.reportForm.get('priority')?.valid;
    const hasLocationSelection = !!this.addressCode || this.hideForm;

    return !!titleValid && !!detailsValid && !!resolutionValid && !!priorityValid && hasLocationSelection;
  }

  private submitIncident(locationCode: string): void {
    if (this.isSubmitting) {
      return;
    }

    const formValue = this.reportForm.value;
    const payload = {
      incidentDetails: formValue.incidentDetails,
      atokaCode: locationCode,
      isAtokaCodeKnown: !this.manualAddressMode,
      longitude: 0,
      latitude: 0,
      incidentTypeId: formValue.incidentTypeId ?? 0,
      incidentDate: new Date().toISOString(),
      incidentPhotoVMs: this.photoFile
        ? [{ photoId: this.photoFile.name, photoUrl: '' }]
        : [],
    };

    this.message = '';
    this.isSubmitting = true;

    this.incidentService.reportIncident(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.responseCode === ResponseCode.Success) {
          this.dialogRef.close({ status: 'success' });
        } else {
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
      this.submitIncident(this.addressCode);
      return;
    }

    if (this.hideForm && this.addressFormComponent) {
      this.addressFormComponent.showFormState
        .pipe(take(1))
        .subscribe({
          next: (code: string) => {
            this.loadingService.hide();
            this.addressCode = code;
            this.reportForm.get('locationCode')?.patchValue(code);
            this.submitIncident(code);
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
}
