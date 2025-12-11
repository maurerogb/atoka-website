import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { NewsletterComponent } from '../../shared/newsletter/newsletter.component';
import { FaqComponent } from "../../shared/faq/faq.component";
import { GetMobileComponent } from "../../shared/get-mobile/get-mobile.component";
import { SupportContactComponent } from "../../shared/support-contact/support-contact.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ButtonComponent,
    NewsletterComponent,
    FaqComponent,
    GetMobileComponent,
    SupportContactComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
