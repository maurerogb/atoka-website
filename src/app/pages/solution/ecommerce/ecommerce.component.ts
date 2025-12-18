import { Component } from '@angular/core';
import { ButtonComponent } from "../../../shared/button/button.component";

@Component({
  selector: 'app-ecommerce',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './ecommerce.component.html',
  styleUrl: './ecommerce.component.scss'
})
export class EcommerceComponent {

}
