import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { NewsletterComponent } from '../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [ButtonComponent, NewsletterComponent],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.scss'
})
export class PricingComponent {

}
