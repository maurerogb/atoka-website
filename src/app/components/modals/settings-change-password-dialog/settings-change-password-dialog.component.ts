import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BaseResponse } from '../../../model/base-response';
import { changePasswordRequest } from '../../../model/authentication';
import { Regex, ResponseCode } from '../../../model/enums';
import { AuthenticationService } from '../../../services/authentication.service';
import { LoadingService } from '../../../services/loading.service';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
  selector: 'app-settings-change-password-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    LoaderComponent,
  ],
  templateUrl: './settings-change-password-dialog.component.html',
  styleUrl: './settings-change-password-dialog.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SettingsChangePasswordDialogComponent {
  form: FormGroup;
  regex = Regex;
  hideCurrent = true;
  hideNew = true;
  hideConfirm = true;
  isSuccess = false;
  isSubmitting = false;
  message = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SettingsChangePasswordDialogComponent>,
    private authService: AuthenticationService,
    public loadingService: LoadingService,
  ) {
    this.form = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchingValidator }
    );
  }

  close(): void {
    this.dialogRef.close({ status: 'cancel' });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.isPasswordStrong) {
      this.form.get('newPassword')?.markAsTouched();
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const loginInfo = this.authService.getLoginInfo();
    if (!loginInfo?.userName) {
      this.message = 'Unable to determine your account. Please sign in again.';
      return;
    }

    this.message = '';
    this.isSubmitting = true;
    this.loadingService.show();

    const payload: changePasswordRequest = {
      userName: loginInfo.userName,
      oldPassword: this.form.value.currentPassword,
      newPassword: this.form.value.newPassword,
    };

    this.authService.changePassword(payload).subscribe({
      next: (res: BaseResponse<any>) => {
        this.isSubmitting = false;
        this.loadingService.hide();
        if (res.responseCode === ResponseCode.Success) {
          this.isSuccess = true;
        } else {
          this.message = res.description || 'Unable to update your password.';
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.loadingService.hide();
        if (err?.error?.description) {
          this.message = err.error.description;
        } else if (err?.description) {
          this.message = err.description;
        } else {
          this.message = 'An error occurred. Please try again.';
        }
      },
    });
  }

  finish(): void {
    this.dialogRef.close({ status: 'success' });
  }

  get isPasswordStrong(): boolean {
    const value = this.form.get('newPassword')?.value ?? '';
    return (
      this.regex.hasUppercase.test(value) &&
      this.regex.hasLowercase.test(value) &&
      this.regex.hasNumeric.test(value) &&
      this.regex.specialChar.test(value)
    );
  }

  passwordMatchingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    return newPassword?.value === confirmPassword?.value ? null : { notmatched: true };
  };
}
