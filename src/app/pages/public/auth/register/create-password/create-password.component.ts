import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { PersonalData } from '../../../../../model/dto/personal-data-dto';
import { RegistrationStep, Regex, ResponseCode } from '../../../../../model/enums';
import { AuthenticationService } from '../../../../../services/authentication.service';
import { userRequest } from '../../../../../model/authentication';
import { BaseResponse } from '../../../../../model/base-response';
import { RegistrationService } from '../../../../../services/registration.service';
import { LoadingService } from '../../../../../services/loading.service';
import { LoaderComponent } from "../../../../../components/loader/loader.component";

@Component({
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatNativeDateModule, MatDatepickerModule, CommonModule, LoaderComponent],
  templateUrl: './create-password.component.html',
  styleUrl: './create-password.component.scss'
})
export class CreatePasswordComponent implements OnInit {
  regex = Regex;
  specialChar = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  hidePassword = true;
  hideConfirmPassword = true;
  registrationForm!: FormGroup
  personalDetails: PersonalData = {};
  message: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private authService: AuthenticationService,
    public loadingService: LoadingService,
  ) { }
  
  ngOnInit(): void {
    this.personalDetails = this.registrationService.getProfile() || {};

    this.createForm();
  }

  createForm() {
    this.registrationForm = this.fb.group(
      {
        userName: [this.personalDetails.emailAddress, [Validators.required, Validators.minLength(6)]],
        password: new FormControl(null, Validators.required),
        confirmPassword: new FormControl(null, [Validators.required]),
      },
      { validators: this.passwordMatchingValidatior }
    );
  }

  createPassword() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    let formData = this.registrationForm.value;
    const profile = this.personalDetails || this.registrationService.getProfile() || {};
    
    if (!profile.userIdentifer) {
      this.message = 'Unable to determine your user identity.';
      return;
    }

    let data: userRequest = {
      userName: formData.userName,
      password: formData.password,
      userId: this.personalDetails.userIdentifer!
    }

    this.authService.createUser(data).subscribe({
      next: (res: BaseResponse<any>) => {
        if (res.responseCode === ResponseCode.Success) {
          this.registrationService.setStep(RegistrationStep.CreatePasswordCompleted);
          this.router.navigate(['register', 'profile-picture']);
        } else {
          this.message = res.description;
        }
      },
      error: (err) => {
        if (err.error) {
          this.message = err.error.description;
        } else {
          this.message = 'An error occurred. Please try again.';
        }
      },
    });
  }

  passwordMatchingValidatior: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password?.value === confirmPassword?.value ? null : { notmatched: true };
  };
}
