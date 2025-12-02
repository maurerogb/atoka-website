import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/button/button.component';
import { NewsletterComponent } from '../../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-retails',
  standalone: true,
  imports: [ButtonComponent,NewsletterComponent],
  templateUrl: './retails.component.html',
  styleUrl: './retails.component.scss'
})
export class RetailsComponent {

}
