import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { NewsletterComponent } from '../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-developer',
  standalone: true,
  imports: [
    ButtonComponent,
    NewsletterComponent
  ],
  templateUrl: './developer.component.html',
  styleUrl: './developer.component.scss'
})
export class DeveloperComponent {

}
