import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { NewsletterComponent } from '../../../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-employee-verification',
  standalone: true,
  imports: [
    ButtonComponent,
    NewsletterComponent
  ],
  templateUrl: './employee-verification.component.html',
  styleUrl: './employee-verification.component.scss'
})
export class EmployeeVerificationComponent {

}
