import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from './notification.service';

function makeNotification(
  notificationId: number,
  isRead: boolean
): {
  sendersName: string;
  notificationId: number;
  message: string;
  reciverId: number;
  isRead: boolean;
  createdOn: string;
} {
  return {
    sendersName: 'ATOKA',
    notificationId,
    message: `Message ${notificationId}`,
    reciverId: 220,
    isRead,
    createdOn: '2025-12-31T14:50:11.223',
  };
}

describe('NotificationService', () => {
  let service: NotificationService;
  let httpMock: HttpTestingController;
  let latestUnreadCount = -1;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);

    service.unreadCount$.subscribe((count) => {
      latestUnreadCount = count;
    });
  });

  afterEach(() => {
    service.stopPolling();
    httpMock.verify();
  });

  it('computes unread count from mixed notifications', () => {
    service.refreshNow();

    const req = httpMock.expectOne('notifications');
    req.flush({
      data: [
        makeNotification(1, false),
        makeNotification(2, true),
        makeNotification(3, false),
      ],
    });

    expect(latestUnreadCount).toBe(2);
  });

  it('emits zero unread count for empty payload', () => {
    service.refreshNow();

    const req = httpMock.expectOne('notifications');
    req.flush({ data: [] });

    expect(latestUnreadCount).toBe(0);
  });

  it('starts polling immediately, repeats every 30s, and avoids duplicate pollers', fakeAsync(() => {
    service.startPolling();

    let req = httpMock.expectOne('notifications');
    req.flush({ data: [makeNotification(1, false)] });
    expect(latestUnreadCount).toBe(1);

    tick(30000);
    req = httpMock.expectOne('notifications');
    req.flush({ data: [] });
    expect(latestUnreadCount).toBe(0);

    service.startPolling();
    tick(30000);

    req = httpMock.expectOne('notifications');
    req.flush({ data: [] });

    service.stopPolling();
    tick(30000);
    httpMock.expectNone('notifications');
  }));

  it('keeps the last unread count on refresh failure', () => {
    service.refreshNow();
    let req = httpMock.expectOne('notifications');
    req.flush({
      data: [
        makeNotification(1, false),
        makeNotification(2, false),
      ],
    });
    expect(latestUnreadCount).toBe(2);

    service.refreshNow();
    req = httpMock.expectOne('notifications');
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(latestUnreadCount).toBe(2);
  });

  it('updates unread count on flagAsRead/delete and triggers reconciliation refresh', () => {
    service.refreshNow();
    let refreshReq = httpMock.expectOne('notifications');
    refreshReq.flush({
      data: [
        makeNotification(1, false),
        makeNotification(2, false),
        makeNotification(3, false),
      ],
    });
    expect(latestUnreadCount).toBe(3);

    service.flagAsRead(1, true).subscribe();
    const flagReq = httpMock.expectOne('Notifications/FlagAsRead/1');
    flagReq.flush({});
    expect(latestUnreadCount).toBe(2);

    refreshReq = httpMock.expectOne('notifications');
    refreshReq.flush({
      data: [
        makeNotification(1, true),
        makeNotification(2, false),
        makeNotification(3, false),
      ],
    });
    expect(latestUnreadCount).toBe(2);

    service.deleteNotification(2, true).subscribe();
    const deleteReq = httpMock.expectOne('Notifications/DeleteNotification/2');
    deleteReq.flush({});
    expect(latestUnreadCount).toBe(1);

    refreshReq = httpMock.expectOne('notifications');
    refreshReq.flush({
      data: [
        makeNotification(1, true),
        makeNotification(3, false),
      ],
    });
    expect(latestUnreadCount).toBe(1);
  });
});
