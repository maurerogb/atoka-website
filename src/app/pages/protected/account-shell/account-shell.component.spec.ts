import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { NotificationService } from '../../../services/notification.service';
import { AuthenticationService } from '../../../services/authentication.service';
import { AccountShellComponent } from './account-shell.component';

class NotificationServiceStub {
  private readonly unreadSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadSubject.asObservable();
  readonly startPolling = jasmine.createSpy('startPolling');
  readonly stopPolling = jasmine.createSpy('stopPolling');
  readonly refreshNow = jasmine.createSpy('refreshNow');

  setUnreadCount(count: number): void {
    this.unreadSubject.next(count);
  }
}

class AuthenticationServiceStub {
  readonly occupantDetails$ = of(undefined);
  readonly ensureOccupantDetailsCached = jasmine
    .createSpy('ensureOccupantDetailsCached')
    .and.returnValue(of(undefined));
  readonly getCachedOccupantDetails = jasmine
    .createSpy('getCachedOccupantDetails')
    .and.returnValue(undefined);
}

describe('AccountShellComponent', () => {
  let component: AccountShellComponent;
  let fixture: ComponentFixture<AccountShellComponent>;
  let notificationService: NotificationServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountShellComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              accountType: 'business-account',
              title: 'Business Account',
            }),
          },
        },
        {
          provide: NotificationService,
          useClass: NotificationServiceStub,
        },
        {
          provide: AuthenticationService,
          useClass: AuthenticationServiceStub,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountShellComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(
      NotificationService
    ) as unknown as NotificationServiceStub;
    fixture.detectChanges();
  });

  it('hides badge when unread count is zero', () => {
    notificationService.setUnreadCount(0);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.notification-badge');
    expect(badge).toBeNull();
  });

  it('shows numeric badge for unread count within range', () => {
    notificationService.setUnreadCount(7);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.notification-badge');
    expect(badge).not.toBeNull();
    expect((badge as HTMLElement).innerText.trim()).toBe('7');
  });

  it('shows 99+ badge when unread count is above 99', () => {
    notificationService.setUnreadCount(120);
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.notification-badge');
    expect(badge).not.toBeNull();
    expect((badge as HTMLElement).innerText.trim()).toBe('99+');
  });
});
