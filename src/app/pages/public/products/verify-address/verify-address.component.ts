import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { NewsletterComponent } from '../../../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-verify-address',
  standalone: true,
  imports: [ButtonComponent, NewsletterComponent],
  templateUrl: './verify-address.component.html',
  styleUrl: './verify-address.component.scss'
})
export class VerifyAddressComponent {

}
