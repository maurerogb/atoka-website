import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NewsletterComponent } from '../../../shared/newsletter/newsletter.component';
import { FaqComponent } from '../../../shared/faq/faq.component';
import { GetMobileComponent } from '../../../shared/get-mobile/get-mobile.component';
import { SupportContactComponent } from '../../../shared/support-contact/support-contact.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterModule, NewsletterComponent, FaqComponent, GetMobileComponent, SupportContactComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

}
