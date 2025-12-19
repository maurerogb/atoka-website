import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { NewsletterComponent } from '../../../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-amenities-check',
  standalone: true,
  imports: [ButtonComponent, NewsletterComponent],
  templateUrl: './amenities-check.component.html',
  styleUrl: './amenities-check.component.scss'
})
export class AmenitiesCheckComponent {

}
