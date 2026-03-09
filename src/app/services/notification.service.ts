import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, Subject, Subscription, catchError, exhaustMap, tap, timer } from 'rxjs';
import { BaseResponse } from '../model/base-response';
import { HttpService } from './http.service';

export type NotificationId = string | number;
export type NotificationMutationResponse = BaseResponse<null>;

export interface ServiceNotification {
  sendersName: string;
  notificationId: number;
  message: string;
  reciverId: number;
  isRead: boolean;
  createdOn: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService extends HttpService<BaseResponse<ServiceNotification[]>> {
  url: string = '';
  private readonly pollIntervalMs = 30000;
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  private readonly refreshTrigger$ = new Subject<void>();
  private readonly subscriptions = new Subscription();
  private pollingSubscription?: Subscription;

  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    super(http);

    this.subscriptions.add(
      this.refreshTrigger$
        .pipe(
          exhaustMap(() =>
            this.getNotifications().pipe(
              tap((response) => {
                this.syncUnreadCount(response.data);
              }),
              catchError(() => EMPTY)
            )
          )
        )
        .subscribe()
    );
  }

  startPolling(): void {
    if (this.pollingSubscription) {
      return;
    }

    this.pollingSubscription = timer(0, this.pollIntervalMs).subscribe(() => {
      this.refreshNow();
    });
  }

  stopPolling(): void {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = undefined;
  }

  refreshNow(): void {
    this.refreshTrigger$.next();
  }

  syncUnreadCount(notifications: ServiceNotification[]): void {
    const unreadCount = notifications.reduce((count, item) => {
      return count + (item.isRead ? 0 : 1);
    }, 0);

    this.unreadCountSubject.next(unreadCount);
  }

  decreaseUnreadCount(): void {
    this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
  }

  getNotifications(): Observable<BaseResponse<ServiceNotification[]>> {
    this.url = 'notifications';
    return this.get<BaseResponse<ServiceNotification[]>>(this.url);
  }

  flagAsRead(
    id: NotificationId,
    shouldDecreaseUnreadCount = false
  ): Observable<NotificationMutationResponse> {
    this.url = `Notifications/FlagAsRead/${encodeURIComponent(String(id))}`;
    return this.put<NotificationMutationResponse>(
      this.url,
      {}
    ).pipe(
      tap(() => {
        if (shouldDecreaseUnreadCount) {
          this.decreaseUnreadCount();
        }

        this.refreshNow();
      })
    );
  }

  deleteNotification(
    id: NotificationId,
    wasUnread = false
  ): Observable<NotificationMutationResponse> {
    this.url = `Notifications/DeleteNotification/${encodeURIComponent(String(id))}`;
    return this.delete<NotificationMutationResponse>(
      this.url
    ).pipe(
      tap(() => {
        if (wasUnread) {
          this.decreaseUnreadCount();
        }

        this.refreshNow();
      })
    );
  }
}
