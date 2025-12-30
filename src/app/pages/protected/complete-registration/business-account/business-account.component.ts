import { CommonModule } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { Router, RouterModule } from "@angular/router";
import { ListItem } from "../../../../model/atoka-query";
import { LoaderComponent } from "../../../../components/loader/loader.component";
import { AtokaSearchComponent } from "../../../../components/atoka-search/atoka-search.component";
import { AddressFormComponent } from "../../../../components/address-form/address-form.component";
import { UploadFileComponent } from "../../../../components/upload-file/upload-file.component";
import { LoadingService } from "../../../../services/loading.service";
import { ResponseCode } from "../../../../model/enums";
import { BusinessService } from "../../../../services/business.service";
import { BaseResponse } from "../../../../model/base-response";
import { take } from "rxjs";
import { AuthenticationService } from "../../../../services/authentication.service";


@Component({
  selector: 'app-business-account',
  standalone: true,
  templateUrl: './business-account.component.html',
  styleUrl: './business-account.component.scss',
  imports: [MatIconModule, CommonModule, ReactiveFormsModule,
    RouterModule, MatFormFieldModule, ReactiveFormsModule, MatInputModule,
     MatSelectModule, MatButtonModule, MatCheckboxModule, MatNativeDateModule,
      MatDatepickerModule, MatProgressSpinnerModule, AtokaSearchComponent,
       AddressFormComponent, UploadFileComponent, LoaderComponent]
})
export class BusinessAccountComponent implements OnInit {
  @ViewChild(AddressFormComponent) addressFormComponent?: AddressFormComponent;

  uploadCAC: boolean = false;
  labelName: string = "Address (Head Office)"
  addressCode: string = "";
  hideForm: boolean = false;
  businessName: string = "";
  businessForm!: FormGroup;
  cacDocument: File | undefined;
  businessLogo: File | undefined;
  businessTypes!: ListItem[];
  businessRoles?: ListItem[];
  message = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthenticationService,
    private businessService: BusinessService,
    public loadingService: LoadingService,
  ) { }

  ngOnInit(): void {
    const userData = this.authService.getLoginInfo();
    if (!userData || userData.hasBusinessInfo || userData.validatedAddress || userData.accountTypeId <= 2) {
      this.router.navigate(['/login']);
    }

    this.createBusinessForm();
    this.getBusinessRoles();
    this.getBusinessType();
  }

  getBusinessType() {
    this.businessService.getBusinessTypes().subscribe({
      next: (resp:BaseResponse<any>) => {
        if(resp.responseCode === ResponseCode.Success){
            this.businessTypes = resp.data;
            // this.toast.success(resp.description, 'Success', {closeButton:true});
        }
      }
    });
  }

  getBusinessRoles() {
    this.businessService.getBusinessRoles().subscribe({
      next: (resp) => {
        this.businessRoles = resp.data;
      }
    });
  }

  saveBusinessInfo() {
    if (this.businessForm.invalid) {
      this.businessForm.markAllAsTouched();
      return;
    }
    
    const proceedWithBusinessSave = () => {
      const data = this.businessForm.value;
      const businessAddress = data.businessAddress;

      if (!businessAddress) {
        this.message = 'Please select or enter a business address before continuing.';
        return;
      }
      
      let formdata = new FormData();
      formdata.append('businessLogFile', this.businessLogo ?? '');
      formdata.append('cacDocFile', this.cacDocument ?? '');

      formdata.append('acceptTM', data.hasAcceptedTC);
      formdata.append('cacDocFile', '');
      formdata.append('roleInBusinessId', data.roleInBusiness);
      formdata.append('atokaCode', data.businessAddress);
      formdata.append('businessLogFile', '');
      formdata.append('businessName', data.businessName);
      formdata.append('businessTypeId', data.businessType);
      formdata.append('isBusinessRegistered', data.isBusinessReg);
      formdata.append('officialEmail', data.businessEmail);
      formdata.append('officialPhone', data.phoneNumber);
      formdata.append('regNumber', data.businessRegNo);

      this.businessService.addBusiness(formdata).subscribe({
        next: res => {
          if (res.responseCode == ResponseCode.Success) {
            // this.toast.success( res.description, 'Success');
            const userData = this.authService.getLoginInfo();
            if (!userData) {
              this.router.navigate(['/login']);
            } else {
              userData.validatedAddress = true;
              userData.hasBusinessInfo = true;
              this.authService.setLoginInfo(userData);
              const route = this.authService.getNavigateRoute(userData);
              if (route) {
                // this.callDalog('/app/user');
                this.router.navigate([route]);
              }
            }
          } else {
            if (res.description) {
              this.message = res.description;
            } else {
              this.message = "An error occurred. Please try again later";
            }
          }
        }
      });
    };

    if (this.hideForm && this.addressFormComponent) {
      this.addressFormComponent.showFormState
        .pipe(take(1))
        .subscribe({
          next: (addressCode: string) => {
            this.businessForm.get('businessAddress')?.patchValue(addressCode);
            proceedWithBusinessSave();
          }
        });

      this.addressFormComponent.save();
    } else {
      proceedWithBusinessSave();
    }
  }

  uploadDocument(value: boolean): void {
    if (value) {
      this.businessForm.get('businessRegNo')?.addValidators(Validators.required)
    } else {
      this.businessForm.get('businessRegNo')?.removeValidators
    }

    this.uploadCAC = value;
  }

  showForm() {
    if (this.hideForm === false) {
      this.hideForm = true;
    }
    else {
      this.hideForm = false;
    }
    
    return this.hideForm;
  }

  setHideForm(event: any) {
    this.addressCode = event;
    this.businessForm.get('businessAddress')?.patchValue(event);
    this.hideForm = false;
  }

  setCACocument(event: File) {
    this.cacDocument = event;
  }

  setBusinessLogo(event: File) {
    this.businessLogo = event;
  }

  setAddressCode(event: any) {
    this.businessForm.get('businessAddress')?.patchValue(event);
  }

  createBusinessForm() {
    this.businessForm = this.fb.group({
      businessName: ['', Validators.required],
      businessType: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      businessEmail: ['', [Validators.required, Validators.email]],
      isBusinessReg: [false, Validators.required],
      roleInBusiness: ['', Validators.required],
      businessAddress: [''],
      businessRegNo: [''],
      hasAcceptedTC: [false, Validators.requiredTrue],
    });
  }
}
