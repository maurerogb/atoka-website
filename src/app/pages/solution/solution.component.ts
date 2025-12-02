import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NewsletterComponent } from '../../shared/newsletter/newsletter.component';
import { ButtonComponent } from '../../shared/button/button.component';

@Component({
  selector: 'app-solution',
  standalone: true,
  imports: [RouterModule, NewsletterComponent, ButtonComponent],
  templateUrl: './solution.component.html',
  styleUrl: './solution.component.scss'
})
export class SolutionComponent {

}
