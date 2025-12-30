import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RegistrationStep, ResponseCode } from '../../../../../model/enums';
import { ListItem } from '../../../../../model/atoka-query';
import { LoaderComponent } from '../../../../../components/loader/loader.component';
import { LoadingService } from '../../../../../services/loading.service';
import { PersonRequest } from '../../../../../model/dto/personal-data-dto';
import { AccountVerficationDialogueComponent } from '../../../../../components/modals/account-verfication-dialogue/account-verfication-dialogue.component';
import { CommonModule } from '@angular/common';
import { RegistrationService } from '../../../../../services/registration.service';

function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (typeof value === 'string' && value.trim().length === 0) {
    return { required: true };
  }

  return null;
}

function dateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (value instanceof Date && !isNaN(value.getTime())) {
    return null;
  }

  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return null;
  }

  return { invalidDate: true };
}

@Component({
  standalone: true,
  imports: [CommonModule, MatIconModule, MatFormFieldModule, ReactiveFormsModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatCheckboxModule,
     MatNativeDateModule, MatDatepickerModule, LoaderComponent],
  templateUrl: './personal-information.component.html',
  styleUrl: './personal-information.component.scss'
})
export class PersonalInformationComponent implements OnInit {
  [x: string]: any;
  personalDetailsform!: FormGroup;
  accountTypes: ListItem[] =[];

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    public loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.registrationService.getAccountTypes().subscribe({
      next: resp => {
        if(resp.responseCode === ResponseCode.Success){
          this.accountTypes = resp.data
        }
      }
    })
  }

  login(){
    this.router.navigate(['/login']);
  }

  register(): void {
    if (this.personalDetailsform.invalid){
      return;
    }

    const formdata = this.personalDetailsform.value;

    let request: PersonRequest ={
      firstName: formdata.firstName,
      surname: formdata.lastName,
      acceptedPolicy: formdata.acceptTM,
      dateOfBirth: formdata.dob,
      gender: formdata.gender === 1 ? "Male" : "Female",
      middleName: formdata.middleName,
      phoneNumber: formdata.phoneNumber,
      accountTypeId: formdata.accountType,
      emailAddress: formdata.emailAddress,
      iownAproperty: false,
      title: ''
    };

    this.verifyUser(request);
  }

  verifyUser(request: any): void {
    const dialogRef = this.dialog.open(AccountVerficationDialogueComponent, {
      data: request,
      width: '40%',
      position: {top: '200px', left: '30.5%', right: '0', bottom: '0'},
      hasBackdrop: true,
      backdropClass: 'backdrop',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.status === 'success') {
        this.registrationService.setProfile(result.data || {});
        this.registrationService.setStep(RegistrationStep.PersonalInformationCompleted);
        this.router.navigate(['register', 'create-password']);
      }
    });
  }

  createForm(){
    this.personalDetailsform = this.fb.group({
      firstName: ['', [Validators.required, noWhitespaceValidator]],
      lastName: ['', [Validators.required, noWhitespaceValidator]],
      middleName: ['', [Validators.required, noWhitespaceValidator]],
      emailAddress: ['', [Validators.required, Validators.email]],
      dob: ['', [Validators.required, dateValidator]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      gender: ['', [Validators.required]],
      accountType: ['', [Validators.required]],
      acceptTM: [false, [Validators.requiredTrue]]
    })
  }
}
