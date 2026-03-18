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
import { BaseResponse } from '../../../../model/base-response';
import { ResponseCode } from '../../../../model/enums';
import { LoadingService } from '../../../../services/loading.service';
import { Address, MoveInDate, ResidenceStartedWebResponse, AddressInfo } from '../../../../model/atoka-query';

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
  addressSelection?: AddressInfo;
  selectedAddressInfo?: Address;
  isAddressFormReadOnly = false;
  manualAddressMode = false;
  addAddressForm!: FormGroup
  labelName: string = 'Address';
  message = '';

  constructor(private regitrationService: RegistrationService, private router: Router,
    private fb: FormBuilder, private authService: AuthenticationService, private dialog: MatDialog,
    public loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    const userData = this.authService.getLoginInfo();
    if (!userData || userData.validatedAddress || userData.accountTypeId > 2) {
      this.router.navigate(['/login']);
    }

    this.addAddressForm = this.fb.group({
      startFrom: ['', Validators.required]
    })
  }

  setAddressCode(value: string) {
    this.addressCode = value;
    if (this.addressSelection?.atokaCode !== value) {
      this.addressSelection = undefined;
      this.selectedAddressInfo = undefined;
      this.isAddressFormReadOnly = false;
      this.hideForm = false;
    }
  }

  setAddressInfo(value: Address | undefined) {
    if (!value?.atoka || !value?.atokaAddressId) {
      this.addressSelection = undefined;
      this.selectedAddressInfo = undefined;
      this.isAddressFormReadOnly = false;
      this.hideForm = false;
      return;
    }

    this.addressSelection = {
      atokaCode: value.atoka,
      atokaAddressId: value.atokaAddressId,
    };
    this.selectedAddressInfo = value;
    this.addressCode = value.atoka;
    this.manualAddressMode = false;
    this.isAddressFormReadOnly = true;
    this.hideForm = true;
  }

  setHideForm(value: AddressInfo) {
    this.addressCode = value.atokaCode;
    this.addressSelection = value;
    this.selectedAddressInfo = undefined;
    this.manualAddressMode = false;
    this.isAddressFormReadOnly = false;
    this.hideForm = false;
  }

  showForm(): boolean {
    this.message = '';
    this.manualAddressMode = true;
    this.isAddressFormReadOnly = false;
    this.hideForm = true;
    this.addressCode = '';
    this.addressSelection = undefined;
    this.selectedAddressInfo = undefined;
    this.addressFormComponent?.resetForm();
    return this.hideForm;
  }

  addAddress() {
    if (!this.hideForm && !this.addressCode) {
      this.message = 'Please select or enter an address before continuing.';
      return;
    }

    const proceedAfterAddressSaved = () => {
      const moveInDate = this.buildMoveInPayload();
      if (!moveInDate) {
        return;
      }

      this.regitrationService.movedInOn(moveInDate).subscribe({
        next: (res: BaseResponse<ResidenceStartedWebResponse>) => {
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

    if (this.manualAddressMode && this.hideForm && this.addressFormComponent) {
      this.addressFormComponent.showFormState
        .pipe(take(1))
        .subscribe({
          next: (savedAddress: AddressInfo) => {
            this.addressCode = savedAddress.atokaCode;
            this.addressSelection = savedAddress;
            this.manualAddressMode = false;
            this.isAddressFormReadOnly = false;
            this.hideForm = false;
            proceedAfterAddressSaved();
          }
        });

      this.addressFormComponent.save();
    } else {
      proceedAfterAddressSaved();
    }
  }

  private buildMoveInPayload(): MoveInDate | null {
    const atokaAddressId = this.addressSelection?.atokaAddressId;
    if (!atokaAddressId) {
      this.message = 'Please select a valid ATOKA address before continuing.';
      return null;
    }

    return {
      startFrom: this.addAddressForm.value.startFrom,
      atokaAddressId,
    };
  }

  callDialog(route: string): void {
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
