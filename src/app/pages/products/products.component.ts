import { Component } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button.component';
import { RouterModule } from '@angular/router';
import { NewsletterComponent } from '../../shared/newsletter/newsletter.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterModule, ButtonComponent,NewsletterComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

}
