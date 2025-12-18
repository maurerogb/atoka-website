import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NewsletterComponent } from '../../shared/newsletter/newsletter.component';
import { SupportContactComponent } from "../../shared/support-contact/support-contact.component";

@Component({
  selector: 'app-solution',
  standalone: true,
  imports: [RouterModule, NewsletterComponent, SupportContactComponent],
  templateUrl: './solution.component.html',
  styleUrl: './solution.component.scss'
})
export class SolutionComponent {

}
