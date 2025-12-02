import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/button/button.component';
import { NewsletterComponent } from '../../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-landlord-verification',
  standalone: true,
  imports: [
    ButtonComponent,
    NewsletterComponent
  ],
  templateUrl: './landlord-verification.component.html',
  styleUrl: './landlord-verification.component.scss'
})
export class LandlordVerificationComponent {

}
