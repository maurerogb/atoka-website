import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-send-tenant-request-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './send-tenant-request-dialog.component.html',
  styleUrl: './send-tenant-request-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SendTenantRequestDialogComponent {
  requestForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SendTenantRequestDialogComponent>,
  ) {
    this.requestForm = this.fb.group({
      emailAddress: ['', [Validators.email]],
      userName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      requestMessage: ['', Validators.required],
    });
  }

  close(): void {
    this.dialogRef.close({ status: 'cancel' });
  }

  submit(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const value = this.requestForm.value;
    this.dialogRef.close({
      status: 'success',
      data: {
        emailAddress: String(value.emailAddress ?? '').trim(),
        userName: String(value.userName ?? '').trim(),
        phoneNumber: String(value.phoneNumber ?? '').trim(),
        requestMessage: String(value.requestMessage ?? '').trim(),
      },
    });
  }
}
