import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

export interface ToastNotificationData {
  title?: string;
  message: string;
  type?: 'success' | 'error';
}

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './toast-notification.component.html',
  styleUrl: './toast-notification.component.scss',
})
export class ToastNotificationComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: ToastNotificationData) {}

  get icon(): string {
    return this.data.type === 'error' ? 'priority_high' : 'check_circle';
  }

  get iconClass(): string {
    return this.data.type === 'error' ? 'error' : 'success';
  }

  get containerClass(): string {
    return this.data.type === 'error' ? 'error' : 'success';
  }

  get titleClass(): string {
    return this.data.type === 'error' ? 'error' : 'success';
  }

  get messageClass(): string {
    return this.data.type === 'error' ? 'error' : 'success';
  }
}
