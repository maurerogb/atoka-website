import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/button/button.component';
import { NewsletterComponent } from '../../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-fintech',
  standalone: true,
  imports: [ButtonComponent, NewsletterComponent],
  templateUrl: './fintech.component.html',
  styleUrl: './fintech.component.scss'
})
export class FintechComponent {

}
