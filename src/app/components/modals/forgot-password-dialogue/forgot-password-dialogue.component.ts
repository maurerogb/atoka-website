import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication.service';
import { BaseResponse } from '../../../model/base-response';
import { LoadingService } from '../../../services/loading.service';
import { ResponseCode } from '../../../model/enums';

@Component({
  selector: 'app-forgot-password-dialogue',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: './forgot-password-dialogue.component.html',
  styleUrl: './forgot-password-dialogue.component.scss',
})
export class ForgotPasswordDialogueComponent {
  form: FormGroup;
  message = '';
  isSubmitting = false;
  isSuccess = false;

  constructor(
    private dialogRef: MatDialogRef<ForgotPasswordDialogueComponent>,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private loadingService: LoadingService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  back(): void {
    this.dialogRef.close({ status: 'back' });
  }

  closeWithSuccess(): void {
    this.dialogRef.close({ status: 'success' });
  }

  continue(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.message = '';
    this.isSubmitting = true;
    this.loadingService.show();

    const email = this.form.value.email;

    this.authService.forgotPassword(email).subscribe({
      next: (res: BaseResponse<any>) => {
        this.isSubmitting = false;
        this.loadingService.hide();
        if (res.responseCode === ResponseCode.Success) {
          this.isSuccess = true;
        } else {
          this.message = res.description || 'Unable to process your request.';
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.loadingService.hide();
        if (err?.description) {
          this.message = err.description;
        } else if (err?.error?.description) {
          this.message = err.error.description;
        } else {
          this.message = 'An error occurred. Please try again later';
        }
      },
    });
  }
}
