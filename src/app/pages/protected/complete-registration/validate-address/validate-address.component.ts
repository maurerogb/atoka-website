import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { AddressFormComponent } from '../../../../components/address-form/address-form.component';
import { AtokaSearchComponent } from '../../../../components/atoka-search/atoka-search.component';
import { LoaderComponent } from '../../../../components/loader/loader.component';
import { RegistrationService } from '../../../../services/registration.service';
import { AuthenticationService } from '../../../../services/authentication.service';
import { take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ResponseCode } from '../../../../model/enums';
import { LoadingService } from '../../../../services/loading.service';

@Component({
  selector: 'app-validate-address',
  standalone: true,
  templateUrl: './validate-address.component.html',
  styleUrl: './validate-address.component.scss',
  imports: [CommonModule, AtokaSearchComponent, MatIconModule, RouterModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule, MatSelectModule, MatButtonModule, MatCheckboxModule, MatNativeDateModule, MatDatepickerModule, AddressFormComponent, LoaderComponent]
})
export class ValidateAddressComponent implements OnInit {
  @ViewChild(AddressFormComponent) addressFormComponent?: AddressFormComponent;

  hideForm: boolean = false;
  addressCode?: string;
  addAddressForm!: FormGroup
  labelName: string = 'Address Code';
  message = '';

  constructor(private regitrationService: RegistrationService, private router: Router,
    private fb: FormBuilder, private authService: AuthenticationService, private dialog: MatDialog,
    public loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    const userData = this.authService.getLoginInfo();
    if (!userData || userData.hasBusinessInfo || userData.validatedAddress || userData.accountTypeId > 2) {
      this.router.navigate(['/login']);
    }

    this.addAddressForm = this.fb.group({
      startFrom: ['', Validators.required]
    })
  }

  setAddressCode(value: any) {
    this.addressCode = value
  }

  setHideForm(value: any) {
    this.addressCode = value;
    this.hideForm = false;
  }

  showForm(): boolean {
    if (this.hideForm === false) {
      this.hideForm = true;
    } else {
      this.hideForm = false;
    }
    
    return this.hideForm;
  }

  addAddress() {
    if (!this.hideForm && !this.addressCode) {
      this.message = 'Please select or enter an address before continuing.';
      return;
    }

    const moveInDate: any = this.addAddressForm.value;
    const proceedAfterAddressSaved = () => {
      this.regitrationService.movedInOn(moveInDate).subscribe({
        next: (res) => {
          if (res.responseCode === ResponseCode.Success) {
            const userData = this.authService.getLoginInfo();
            if (!userData) {
              this.router.navigate(['/login']);
            } else {
              userData.validatedAddress = true;
              this.authService.setLoginInfo(userData);
              const route = this.authService.getNavigateRoute(userData);
              if (route) {
                // this.callDalog('/app/user');
                this.router.navigate([route]);
              }
            }
          } else {
            if (res.description) {
              this.message = res.description
            } else {
              this.message = 'An error occured. Please try again'
            }
          }
        },
        error: (err) => {
          if (err.description) {
            this.message = err.description
          } else if (err.error.description) {
            this.message = err.error.description
          } else {
            this.message = 'An error occured. Please try again'
          }
        }
      });
    };

    if (this.hideForm && this.addressFormComponent) {
      this.addressFormComponent.showFormState
        .pipe(take(1))
        .subscribe({
          next: () => {
            proceedAfterAddressSaved();
          }
        });

      this.addressFormComponent.save();
    } else {
      proceedAfterAddressSaved();
    }
  }

  callDalog(route: string): void {
    // const dialogRef = this.dialog.open(ProccessComletedprivatedialogComponent, {
    //   data: 'Michael',
    //   width: '40%',
    //   position: { top: '200px', left: '30.5%', right: '0', bottom: '0' },
    //   hasBackdrop: true,
    //   backdropClass: 'backdrop',
    //   disableClose: true,
    // });

    // dialogRef.afterClosed().subscribe(result => result && this.router.navigate([route]));
  }
}
