import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { NewsletterComponent } from '../../../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-risk',
  standalone: true,
  imports: [ButtonComponent, NewsletterComponent],
  templateUrl: './risk.component.html',
  styleUrl: './risk.component.scss'
})
export class RiskComponent {

}
