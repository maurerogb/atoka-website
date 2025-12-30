import { Component } from '@angular/core';
import { ButtonComponent } from '../../../shared/button/button.component';
import { SupportContactComponent } from '../../../shared/support-contact/support-contact.component';

@Component({
  selector: 'app-career',
  standalone: true,
  imports: [ButtonComponent, SupportContactComponent],
  templateUrl: './career.component.html',
  styleUrl: './career.component.scss'
})
export class CareerComponent {

}
