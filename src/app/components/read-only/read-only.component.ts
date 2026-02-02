import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-read-only',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './read-only.component.html',
  styleUrl: './read-only.component.scss'
})
export class ReadOnlyComponent {
  @Input() customInputClass: any;
  @Input() customClass!: string;
  @Input() value!: string;
  @Input() type: string = 'text';

}
