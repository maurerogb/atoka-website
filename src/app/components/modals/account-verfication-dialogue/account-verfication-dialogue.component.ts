import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormControl } from '@angular/forms';
import { ResponseCode, VerificationOption, VerificationState } from '../../../model/enums';
import { NgOtpInputModule } from 'ng-otp-input';
import { PersonalData, PersonRequest } from '../../../model/dto/personal-data-dto';
import { BaseResponse } from '../../../model/base-response';
import { MatIconModule } from "@angular/material/icon";
import { RegistrationService } from '../../../services/registration.service';

@Component({
  selector: 'app-account-verfication-dialogue',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, NgOtpInputModule, MatIconModule],
  templateUrl: './account-verfication-dialogue.component.html',
  styleUrl: './account-verfication-dialogue.component.scss'
})
export class AccountVerficationDialogueComponent {
  states = VerificationState;
  options = VerificationOption;
  identifer?: string;
  currentState = this.states.Default;
  verificationOption = new FormControl();
  otp = new FormControl();
  message = '';
  countdownMinutes = 1;
  isCountingDown = false;
  remainingSeconds = 0;
  private countdownIntervalId: any;

  constructor(
    public dialogRef: MatDialogRef<AccountVerficationDialogueComponent>,
    private registrationService: RegistrationService,
    @Inject(MAT_DIALOG_DATA) public data: PersonRequest,
  ) {}

  back(): void {
    this.dialogRef.close({ status: 'back' });
  }

  verifySuccess(): void {
    this.dialogRef.close({ status: 'success' });
  }

  sendOTP() {
    this.message = ''
    this.registrationService.generateOTP(this.identifer).subscribe({
      next: (responses: BaseResponse<any>) => {
        if (responses.responseCode === ResponseCode.Success) {
          this.currentState = this.states.OTP;
          this.data.valideOption = this.verificationOptionLabel;
          this.startCountdown();
          // this.toastServ.success(responses.description, 'Success')
        } else {
          this.currentState = this.states.Default;
          this.message = responses.description;
          // this.toastServ.error(responses.description, 'Error')
        }
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  resendOTP() {
    this.sendOTP();
  }

  optionSelected(option: VerificationOption) {
    this.verificationOption.setValue(option);
    
    if (!this.data) {
      this.currentState = this.states.Default;
      this.message = "Missing record";
      return;
    }

    this.identifer = (this.verificationOption.value === this.options.Phone) ? this.data.phoneNumber : this.data.emailAddress;
    this.sendOTP();
  }

  backToSelection() {
    this.currentState = this.states.Default;
    this.isCountingDown = false
  }

  private startCountdown(): void {
    this.isCountingDown = true;
    this.remainingSeconds = this.countdownMinutes * 60;

    if (this.countdownIntervalId) {
      clearInterval(this.countdownIntervalId);
    }

    this.countdownIntervalId = setInterval(() => {
      this.remainingSeconds--;

      if (this.remainingSeconds <= 0) {
        clearInterval(this.countdownIntervalId);
        this.countdownIntervalId = null;
        this.isCountingDown = false;
      }
    }, 1000);
  }

  get countdownDisplay(): string {
    const total = this.remainingSeconds || 0;
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    const mm = minutes.toString().padStart(2, '0');
    const ss = seconds.toString().padStart(2, '0');
    return `${mm}:${ss}`;
  }

  verifyAccount() {
    if (this.otp.value.length !== 6) {
      this.message = "Provide 6 digit token sent to you."
      return;
    }

    const payload: PersonRequest = {
      ...this.data,
      otp: this.otp.value,
    };

    this.registrationService.createProfile(payload).subscribe({
      next: (resp: BaseResponse<PersonalData>) => {
        if (resp.responseCode === ResponseCode.Success) {
          this.currentState = this.states.Success;
          this.dialogRef.close({
            status: 'success',
            data: resp.data,
          });
        } else {
          this.currentState = this.states.OTP;
          this.message = resp.description;
        }
      },
      error: (err) => {
        console.error(err);
        this.currentState = this.states.OTP;
        if (err.error) {
          this.message = err.error.description;
        } else {
          this.message = 'An error occurred. Please try again.';
        }
      },
    });
  }

  get verificationOptionLabel(): string {
    if (this.currentState === this.states.Default) return '';
    return (this.verificationOption.value === this.options.Phone) ? 'Phone' : 'Email';
  }
}
