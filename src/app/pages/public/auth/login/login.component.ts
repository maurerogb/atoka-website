import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { loginInfo, loginRequest } from '../../../../model/authentication';
import { AuthenticationService } from '../../../../services/authentication.service';
import { LoadingService } from '../../../../services/loading.service';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderComponent } from "../../../../components/loader/loader.component";
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordDialogueComponent } from '../../../../components/modals/forgot-password-dialogue/forgot-password-dialogue.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    LoaderComponent
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginfrom!: FormGroup;
  message = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    public loadingService: LoadingService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loginfrom = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: false,
    });

    if (this.authService.isLoggedIn()) {
      const existing = this.authService.getLoginInfo();
      if (existing) {
        this.navigate(existing);
      }
    }
  }

  signup(): void {
    this.router.navigate(['/register']);
  }

  openForgotPasswordDialog(): void {
    this.dialog.open(ForgotPasswordDialogueComponent, {
      width: '35%',
      position: { top: '200px', left: '30.5%', right: '0', bottom: '0' },
      hasBackdrop: true,
      backdropClass: 'backdrop',
      disableClose: true,
    });
  }

  signIn(): void {
    if (this.loginfrom.invalid) {
      this.loginfrom.markAllAsTouched();
      return;
    }

    const value = this.loginfrom.value;

    const login: loginRequest = {
      userName: value.username,
      password: value.password,
      rememberMe: value.rememberMe,
    };

    this.authService.loginAndValidateAddress(login).subscribe({
      next: (info: loginInfo) => {
        this.navigate(info);
      },
      error: (err: any) => {
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

  navigate(data: loginInfo) {
    const route = this.authService.getNavigateRoute(data);
    if (route) {
      this.router.navigate([route]);
    }    
  }
}
