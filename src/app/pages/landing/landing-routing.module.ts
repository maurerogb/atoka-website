import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { HomeComponent } from '../home/home.component';
import { PricingComponent } from '../pricing/pricing.component';
import { DeveloperComponent } from '../developer/developer.component';
import { CareerComponent } from '../career/career.component';
import { SolutionComponent } from '../solution/solution.component';
import { BlogComponent } from '../blog/blog.component';
import { EducationComponent } from '../solution/education/education.component';
import { FintechComponent } from '../solution/fintech/fintech.component';
import { GovernmentComponent } from '../solution/government/government.component';
import { RetailsComponent } from '../solution/retails/retails.component';
import { RiskComponent } from '../solution/risk/risk.component';
import { SolutionPageComponent } from '../solution/solution-page/solution-page.component';
import { EcommerceComponent } from '../solution/ecommerce/ecommerce.component';
;

const routes: Routes = [
  {
    path: '', component: LandingComponent,

    children: [
      {path: '', component: HomeComponent},
      {
        path: 'products', loadChildren: () => import('../products/products/products.module').then(m => m.ProductsModule)
      },
      {path: 'pricing', component: PricingComponent},
      {path: 'developer', component: DeveloperComponent},
      {path: 'career', component: CareerComponent},
      {path: '', component: SolutionComponent,
      children: [
        {path: 'education', component: EducationComponent},
        {path: 'fintech', component: FintechComponent},
        {path: 'government', component: GovernmentComponent},
        {path: 'retails', component: RetailsComponent},
        {path: 'risk', component: RiskComponent},
        {path: 'solution-page', component: SolutionPageComponent},
        {path: 'ecommerce', component: EcommerceComponent},
      ]
      },
      {path: 'blog', component: BlogComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingRoutingModule { }
