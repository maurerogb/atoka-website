import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ToastNotificationComponent,
  ToastNotificationData,
} from '../shared/toast-notification/toast-notification.component';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  show(
    title: string | undefined,
    message: string,
    type: ToastNotificationData['type'] = 'success',
  ): void {
    this.snackBar.openFromComponent(ToastNotificationComponent, {
      data: {
        title,
        message,
        type,
      },
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['atoka-toast-panel'],
    });
  }

  success(message: string, title?: string): void {
    this.show(title, message, 'success');
  }

  error(message: string, title?: string): void {
    this.show(title, message, 'error');
  }
}
