import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, AbstractControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { LoaderComponent } from '../../../../components/loader/loader.component';
import { Regex, ResponseCode } from '../../../../model/enums';
import { AuthenticationService } from '../../../../services/authentication.service';
import { LoadingService } from '../../../../services/loading.service';
import { changePasswordRequest } from '../../../../model/authentication';
import { BaseResponse } from '../../../../model/base-response';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatChipsModule,
    LoaderComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  regex = Regex;
  hideOldPassword = true;
  hidePassword = true;
  hideConfirmPassword = true;
  resetForm!: FormGroup;
  message = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    public loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    const userNameFromQuery = this.route.snapshot.queryParamMap.get('user') || '';
    this.createForm(userNameFromQuery);
  }

  createForm(userName: string): void {
    this.resetForm = this.fb.group(
      {
        userName: [userName, [Validators.required, Validators.minLength(6)]],
        oldPassword: new FormControl(null, Validators.required),
        newPassword: new FormControl(null, Validators.required),
        confirmPassword: new FormControl(null, Validators.required),
      },
      { validators: this.passwordMatchingValidator }
    );
  }

  passwordMatchingValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    return newPassword?.value === confirmPassword?.value ? null : { notmatched: true };
  };

  resetPassword(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.authService.clearLoginInfo();

    const formValue = this.resetForm.value;

    const payload: changePasswordRequest = {
      userName: formValue.userName,
      oldPassword: formValue.oldPassword,
      newPassword: formValue.newPassword,
    };
    
    this.authService.changePassword(payload).subscribe({
      next: (res: BaseResponse<any>) => {
        if (res.responseCode === ResponseCode.Success) {
          this.router.navigate(['/login']);
        } else {
          this.message = res.description;
        }
      },
      error: (err: any) => {
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

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
}
