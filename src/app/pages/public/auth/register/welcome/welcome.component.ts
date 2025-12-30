import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogClose, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RegistrationService } from '../../../../../services/registration.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements OnInit {
  fullname: string = '';

  readonly dialog = inject(MatDialog);

  constructor(private router: Router, private registrationService: RegistrationService) {}

  ngOnInit(): void {
    const state = window.history.state as { fullname?: string };

    if (state?.fullname) {
      this.fullname = state.fullname;
      this.dialog.open(WelcomeDialog, { disableClose: true, hasBackdrop: false });
      this.registrationService.clearProfile()
      this.registrationService.clearStep()
    } else {
      this.router.navigate(['/login']);
    }
  }
}

@Component({
  standalone: true,
  selector: 'dialog-elements-example-dialog',
  template: `<div mat-dialog-content class="items-center grid grid-cols-1 p-5">
    <div class="atoka-form-header">
        <h1>Great Job!</h1>
    </div>
    <div class="flex flex-col justify-center items-center gap-8 pt-5 mt-3">
        <img src="assets/images/thumbs-up.svg"/>
        <p class="text-sm font-light text-gray-500">Your account has been successfully created.</p>
        <button type="button" mat-flat-button mat-dialog-close color="primary" (click)="login()">
            Get Started
        </button>
    </div>
</div>`,
  imports: [MatButtonModule, MatDialogContent, MatDialogClose]
})

export class WelcomeDialog {
  constructor(private router: Router) {}
  login() {
    this.router.navigate(['/login'])
  }
}
