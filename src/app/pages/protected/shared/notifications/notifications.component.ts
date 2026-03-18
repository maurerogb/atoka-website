import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import {
  NotificationId,
  NotificationService,
  ServiceNotification,
} from '../../../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: ServiceNotification[] = [];
  selectedNotification: ServiceNotification | null = null;
  isLoading = false;
  isDeleting = false;
  errorMessage = '';
  deleteError = '';
  private readonly subscriptions = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.subscriptions.add(
      this.notificationService.getNotifications().subscribe({
        next: (response) => {
          this.notifications = response.data;
          this.notificationService.syncUnreadCount(this.notifications);

          if (this.selectedNotification) {
            const updatedSelection = this.notifications.find(
              (item) =>
                item.notificationId === this.selectedNotification?.notificationId
            );
            this.selectedNotification = updatedSelection ?? null;
          }

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage =
            'Unable to load notifications at the moment. Please try again.';
        },
      })
    );
  }

  selectNotification(notification: ServiceNotification): void {
    this.selectedNotification = notification;
    const wasUnread = !notification.isRead;
    this.updateReadState(notification.notificationId, true);

    this.subscriptions.add(
      this.notificationService
        .flagAsRead(notification.notificationId, wasUnread)
        .subscribe({
        next: () => {
          this.updateReadState(notification.notificationId, true);
        },
        })
    );
  }

  deleteSelectedNotification(event: Event): void {
    event.stopPropagation();

    if (!this.selectedNotification || this.isDeleting) {
      return;
    }

    const notificationId = this.selectedNotification.notificationId;
    const wasUnread = !this.selectedNotification.isRead;
    this.isDeleting = true;
    this.deleteError = '';

    this.subscriptions.add(
      this.notificationService.deleteNotification(notificationId, wasUnread).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(
            (item) => item.notificationId !== notificationId
          );
          this.selectedNotification = null;
          this.isDeleting = false;
        },
        error: () => {
          this.deleteError =
            'Unable to delete this notification right now. Please try again.';
          this.isDeleting = false;
        },
      })
    );
  }

  getTimeAgo(dateValue: string): string {
    if (!dateValue) {
      return 'Unknown time';
    }

    const createdDate = new Date(dateValue);
    if (Number.isNaN(createdDate.getTime())) {
      return 'Unknown time';
    }

    const elapsedMs = Date.now() - createdDate.getTime();
    if (elapsedMs <= 0) {
      return 'just now';
    }

    const seconds = Math.floor(elapsedMs / 1000);
    if (seconds < 60) {
      return 'just now';
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days}d ago`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 5) {
      return `${weeks}w ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return `${months}mo ago`;
    }

    const years = Math.floor(days / 365);
    return `${years}y ago`;
  }

  private updateReadState(id: NotificationId, readState: boolean): void {
    this.notifications = this.notifications.map((item) =>
      item.notificationId === id ? { ...item, isRead: readState } : item
    );

    if (this.selectedNotification?.notificationId === id) {
      this.selectedNotification = {
        ...this.selectedNotification,
        isRead: readState,
      };
    }
  }
}
