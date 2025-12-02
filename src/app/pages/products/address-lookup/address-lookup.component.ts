import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/button/button.component';
import { NewsletterComponent } from '../../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-address-lookup',
  standalone: true,
  imports: [ButtonComponent, NewsletterComponent],
  templateUrl: './address-lookup.component.html',
  styleUrl: './address-lookup.component.scss'
})
export class AddressLookupComponent {

}
