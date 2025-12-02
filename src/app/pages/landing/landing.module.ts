import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './landing-routing.module';
import { ProductsModule } from '../products/products/products.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LandingRoutingModule,
    ProductsModule
  ]
})
export class LandingModule { }
