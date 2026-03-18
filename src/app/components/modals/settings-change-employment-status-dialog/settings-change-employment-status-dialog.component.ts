import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-settings-change-employment-status-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
  ],
  templateUrl: './settings-change-employment-status-dialog.component.html',
  styleUrl: './settings-change-employment-status-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SettingsChangeEmploymentStatusDialogComponent {
  form: FormGroup;
  isSuccess = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SettingsChangeEmploymentStatusDialogComponent>,
  ) {
    this.form = this.fb.group({
      employed: [true],
    });
  }

  get statusLabel(): string {
    return this.form.value.employed ? 'Employed' : 'Unemployed';
  }

  close(): void {
    this.dialogRef.close({ status: 'cancel' });
  }

  submit(): void {
    this.isSuccess = true;
  }

  finish(): void {
    this.dialogRef.close({
      status: 'success',
      employed: this.form.value.employed,
    });
  }
}
