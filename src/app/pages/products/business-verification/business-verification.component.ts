import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/button/button.component';
import { NewsletterComponent } from '../../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-business-verification',
  standalone: true,
  imports: [
    ButtonComponent,
    NewsletterComponent
  ],
  templateUrl: './business-verification.component.html',
  styleUrl: './business-verification.component.scss'
})
export class BusinessVerificationComponent {

}
