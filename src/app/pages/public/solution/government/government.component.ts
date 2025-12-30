import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../shared/button/button.component';
import { NewsletterComponent } from '../../../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-government',
  standalone: true,
  imports: [ButtonComponent, NewsletterComponent],
  templateUrl: './government.component.html',
  styleUrl: './government.component.scss'
})
export class GovernmentComponent {

}
