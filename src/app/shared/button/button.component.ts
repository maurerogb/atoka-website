import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input() buttonRouterLink?: string;
  @Input() iconUrl?: string;
  @Output() buttonClick = new EventEmitter<any>();
  @Input() buttonStyles?: string;
  @Input() buttonText!: string;
  @Input() disabled!: boolean

  constructor(private router: Router) {}

  onClick() {
    if (this.buttonRouterLink) {
      this.router.navigateByUrl(this.buttonRouterLink);
    } else {
      this.buttonClick.emit(true);
    }
  }
}
