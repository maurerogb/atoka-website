import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddressLookupComponent } from '../address-lookup/address-lookup.component';
import { AddressVerificationComponent } from '../address-verification/address-verification.component';
import { AmenitiesCheckComponent } from '../amenities-check/amenities-check.component';
import { BusinessVerificationComponent } from '../business-verification/business-verification.component';
import { EmployeeVerificationComponent } from '../employee-verification/employee-verification.component';
import { LandlordVerificationComponent } from '../landlord-verification/landlord-verification.component';
import { ProductsComponent } from '../products.component';
import { VerifyAddressComponent } from '../verify-address/verify-address.component';
import { EmailVerificationComponent } from '../email-verification/email-verification.component';

const routes: Routes = [
  {path: '', component: ProductsComponent,
      children: [
        {path: 'address-verification', component: AddressVerificationComponent},
        {path: 'amenities-check', component: AmenitiesCheckComponent},
        {path: 'verify-address', component: VerifyAddressComponent},
        {path: 'address-lookup', component: AddressLookupComponent},
        {path: 'business-verification', component: BusinessVerificationComponent},
        {path: 'employee-verification', component: EmployeeVerificationComponent},
        {path: 'landlord-verification', component: LandlordVerificationComponent},
        {path: 'email-verification', component: EmailVerificationComponent},
      ]
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
