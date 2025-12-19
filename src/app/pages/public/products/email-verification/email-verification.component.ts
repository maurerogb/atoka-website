import { Component } from '@angular/core';
import { ButtonComponent } from "../../../../shared/button/button.component";

@Component({
  selector: 'app-email-verification',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.scss'
})
export class EmailVerificationComponent {

}
