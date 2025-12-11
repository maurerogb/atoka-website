import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { NewsletterComponent } from '../../shared/newsletter/newsletter.component';
import { GetMobileComponent } from "../../shared/get-mobile/get-mobile.component";
import { SupportContactComponent } from "../../shared/support-contact/support-contact.component";
import { FaqComponent } from "../../shared/faq/faq.component";

@Component({
  selector: 'app-developer',
  standalone: true,
  imports: [
    ButtonComponent,
    NewsletterComponent,
    GetMobileComponent,
    SupportContactComponent,
    FaqComponent
],
  templateUrl: './developer.component.html',
  styleUrl: './developer.component.scss'
})
export class DeveloperComponent {

}
