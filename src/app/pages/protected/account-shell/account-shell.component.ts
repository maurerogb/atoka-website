import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { filter, Subscription, take } from 'rxjs';
import { ACCOUNT_NAV_CONFIG } from './account-nav.config';
import { INavContent, INavItem } from '../../../model/nav';
import { PersonalData } from '../../../model/dto/personal-data-dto';
import { NotificationService } from '../../../services/notification.service';
import { AuthenticationService } from '../../../services/authentication.service';

interface SidebarDropdownGroup {
  key: string;
  label: string;
  icon: string;
  activeIcon: string;
  hoverIcon: string;
  items: INavItem[];
  isOpen: boolean;
}

interface SidebarTopEntry {
  key: string;
  kind: 'item' | 'dropdown';
  navItem?: INavItem;
  dropdownGroup?: SidebarDropdownGroup;
}

@Component({
  selector: 'app-account-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './account-shell.component.html',
  styleUrl: './account-shell.component.scss',
})
export class AccountShellComponent implements OnInit, OnDestroy {
  navItems: INavContent = { topNav: [], bottomNav: [], hasProfileDisplay: false, description: '' };
  sidebarTopEntries: SidebarTopEntry[] = [];
  sidebarDropdownGroups: SidebarDropdownGroup[] = [];
  title = '';
  description = '';
  notificationRoute = '/app';
  settingsRoute = '/app';
  unreadCount = 0;
  showAddressVerificationButton = false;
  addressVerificationLink = '';
  showNav = false;
  isSidebarCollapsed = false;
  profileImageUrl = '';
  isProfileImageErrored = false;
  hoveredNavKey = '';
  private baseTitle = '';
  private baseDescription = '';
  private readonly subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthenticationService,
  ) {
    this.subscriptions.add(
      this.route.data.subscribe((data) => {
        const accountType = (data['accountType'] as string) ?? '';
        this.baseTitle = (data['title'] as string) ?? this.formatAccountType(accountType);
        this.notificationRoute = this.buildNotificationRoute(accountType);
        this.navItems = ACCOUNT_NAV_CONFIG[accountType] ?? {
          topNav: [],
          bottomNav: [],
          hasProfileDisplay: false,
        };
        this.setSidebarNavGroups();
        this.baseDescription = this.navItems.description ?? '';
        this.addressVerificationLink = this.findAddressVerificationLink();
        this.settingsRoute = this.findSettingsLink();
        this.updateHeaderForUrl(this.router.url);
      })
    );

    this.subscriptions.add(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe((event) => {
          this.updateHeaderForUrl(event.urlAfterRedirects);
          this.expandActiveSidebarGroups();
        })
    );
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.occupantDetails$.subscribe((details) => {
        this.setProfileImage(details);
      })
    );

    this.setProfileImage(this.authService.getCachedOccupantDetails());

    // Prime occupant details once at shell level so feature pages can read from cache.
    this.subscriptions.add(
      this.authService
        .ensureOccupantDetailsCached()
        .pipe(take(1))
        .subscribe((details) => {
          this.setProfileImage(details);
        })
    );

    this.subscriptions.add(
      this.notificationService.unreadCount$.subscribe((count) => {
        this.unreadCount = Math.max(0, count);
      })
    );

    this.syncPollingWithVisibility();
  }

  ngOnDestroy(): void {
    this.notificationService.stopPolling();
    this.subscriptions.unsubscribe();
  }

  get notificationBadgeLabel(): string {
    if (this.unreadCount > 99) {
      return '99+';
    }

    return String(this.unreadCount);
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    this.syncPollingWithVisibility();
  }

  private formatAccountType(accountType: string): string {
    if (!accountType) {
      return 'Account';
    }

    return accountType
      .split('-')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  openNav() {
    this.showNav = !this.showNav
  }
  
  toggle() {
    document.getElementById('sidebar')?.classList.toggle("showSidebar")
  }

  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  handleSidebarToggle(): void {
    if (this.isMobileSidebar()) {
      this.isSidebarCollapsed = false;
      this.toggle();
      return;
    }

    this.toggleSidebarCollapse();
  }

  get sidebarToggleLabel(): string {
    if (this.isMobileSidebar()) {
      return 'Toggle sidebar menu';
    }

    return this.isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar';
  }

  toggleDropdownMenu(groupKey: string): void {
    const group = this.sidebarDropdownGroups.find((item) => item.key === groupKey);
    if (!group) {
      return;
    }

    if (this.isSidebarCollapsed) {
      this.router.navigateByUrl(group.items[0]?.routerLink || '/app');
      return;
    }

    group.isOpen = !group.isOpen;
  }

  private updateHeaderForUrl(url: string): void {
    if (this.isNotificationRoute(url)) {
      this.title = 'Notifications';
      this.description = 'Review your latest messages and account alerts.';
      this.showAddressVerificationButton = false;
      return;
    }

    const activeNavItem = this.findActiveNavItem(url);
    this.title = activeNavItem?.title ?? activeNavItem?.name ?? this.baseTitle;
    this.description = activeNavItem?.description ?? this.baseDescription;
    this.showAddressVerificationButton = Boolean(
      activeNavItem?.showAddressVerificationButton && this.addressVerificationLink
    );
  }

  private findActiveNavItem(url: string): INavItem | undefined {
    const allItems = [...this.navItems.topNav, ...this.navItems.bottomNav];
    if (!allItems.length) {
      return undefined;
    }

    const normalizedUrl = this.normalizeUrl(url);
    let bestMatch: INavItem | undefined;
    let bestLength = -1;

    for (const item of allItems) {
      const normalizedLink = this.normalizeUrl(item.routerLink);
      if (!normalizedLink) {
        continue;
      }

      const isMatch = this.matchesNavItemByNormalizedUrl(normalizedUrl, item);

      if (isMatch && normalizedLink.length > bestLength) {
        bestMatch = item;
        bestLength = normalizedLink.length;
      }
    }

    return bestMatch;
  }

  private normalizeUrl(value: string): string {
    if (!value) {
      return '';
    }

    const [path] = value.split('?');
    const [withoutHash] = path.split('#');

    if (withoutHash.length > 1 && withoutHash.endsWith('/')) {
      return withoutHash.slice(0, -1);
    }

    return withoutHash;
  }

  private isNotificationRoute(url: string): boolean {
    return this.normalizeUrl(url).endsWith('/notifications');
  }

  private buildNotificationRoute(accountType: string): string {
    return accountType ? `/app/${accountType}/notifications` : '/app';
  }

  private findAddressVerificationLink(): string {
    const allItems = [...this.navItems.topNav, ...this.navItems.bottomNav];
    for (const item of allItems) {
      const normalizedLink = this.normalizeUrl(item.routerLink);
      if (normalizedLink.endsWith('/address-verification')) {
        return item.routerLink;
      }
    }

    return '';
  }

  private setSidebarNavGroups(): void {
    const topItems = this.navItems.topNav ?? [];
    const openStateByKey = new Map(
      this.sidebarDropdownGroups.map((group) => [group.key, group.isOpen]),
    );
    const groupMap = new Map<string, SidebarDropdownGroup>();
    const topEntries: SidebarTopEntry[] = [];

    for (const item of topItems) {
      const groupKey = this.getDropdownGroupKey(item);
      if (!groupKey) {
        topEntries.push({
          key: `item-${item.routerLink}-${topEntries.length}`,
          kind: 'item',
          navItem: item,
        });
        continue;
      }

      const existing = groupMap.get(groupKey);
      if (existing) {
        existing.items.push(item);
        continue;
      }

      const newGroup: SidebarDropdownGroup = {
        key: groupKey,
        label: this.getDropdownGroupLabel(item, groupKey),
        icon: item.menuGroupIcon || item.activeIcon || item.inactiveIcon,
        activeIcon: item.activeIcon || item.menuGroupIcon || item.inactiveIcon,
        hoverIcon: item.hoverIcon || item.activeIcon || item.menuGroupIcon || item.inactiveIcon,
        items: [item],
        isOpen: Boolean(openStateByKey.get(groupKey)),
      };
      groupMap.set(groupKey, newGroup);
      topEntries.push({
        key: `dropdown-${groupKey}`,
        kind: 'dropdown',
        dropdownGroup: newGroup,
      });
    }

    this.sidebarDropdownGroups = Array.from(groupMap.values());
    this.sidebarTopEntries = topEntries;
    this.expandActiveSidebarGroups();
  }

  private getDropdownGroupKey(item: INavItem): string {
    return item.menuGroup?.trim().toLowerCase() || '';
  }

  private getDropdownGroupLabel(item: INavItem, groupKey: string): string {
    const configuredLabel = item.menuGroupLabel?.trim();
    if (configuredLabel) {
      return configuredLabel;
    }

    return groupKey
      .split(/[\s_-]+/)
      .filter((part) => Boolean(part))
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  isDropdownGroupActive(group: SidebarDropdownGroup): boolean {
    return group.items.some((item) => this.matchesNavItem(this.router.url, item));
  }

  private expandActiveSidebarGroups(): void {
    for (const group of this.sidebarDropdownGroups) {
      if (this.isDropdownGroupActive(group)) {
        group.isOpen = true;
      }
    }
  }

  trackSidebarTopEntry(index: number, entry: SidebarTopEntry): string | number {
    return entry.key || index;
  }

  getNavIcon(nav: INavItem | undefined, isActive: boolean): string {
    if (!nav) {
      return '';
    }

    if (isActive) {
      return nav.activeIcon;
    }

    return this.hoveredNavKey === this.getNavKey(nav)
      ? nav.hoverIcon || nav.activeIcon
      : nav.inactiveIcon;
  }

  getDropdownIcon(group: SidebarDropdownGroup | undefined, isActive: boolean): string {
    if (!group) {
      return '';
    }

    if (isActive) {
      return group.activeIcon;
    }

    return this.hoveredNavKey === this.getDropdownKey(group)
      ? group.hoverIcon
      : group.icon;
  }

  setHoveredNavKey(key: string): void {
    this.hoveredNavKey = key;
  }

  clearHoveredNavKey(): void {
    this.hoveredNavKey = '';
  }

  getNavKey(nav: INavItem | undefined): string {
    return nav?.routerLink || '';
  }

  getDropdownKey(group: SidebarDropdownGroup | undefined): string {
    return group ? `dropdown-${group.key}` : '';
  }

  private isMobileSidebar(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  }

  private matchesNavItem(url: string, item: INavItem): boolean {
    const normalizedUrl = this.normalizeUrl(url);
    return this.matchesNavItemByNormalizedUrl(normalizedUrl, item);
  }

  private matchesNavItemByNormalizedUrl(normalizedUrl: string, item: INavItem): boolean {
    const normalizedLink = this.normalizeUrl(item.routerLink);
    if (!normalizedLink) {
      return false;
    }

    return item.exact
      ? normalizedUrl === normalizedLink
      : normalizedUrl === normalizedLink || normalizedUrl.startsWith(`${normalizedLink}/`);
  }

  private findSettingsLink(): string {
    const allItems = [...this.navItems.topNav, ...this.navItems.bottomNav];
    for (const item of allItems) {
      const normalizedLink = this.normalizeUrl(item.routerLink);
      if (normalizedLink.endsWith('/settings')) {
        return item.routerLink;
      }
    }

    return '/app';
  }

  private syncPollingWithVisibility(): void {
    if (typeof document === 'undefined' || document.visibilityState === 'visible') {
      this.notificationService.startPolling();
      return;
    }

    this.notificationService.stopPolling();
  }

  onProfileImageError(): void {
    this.isProfileImageErrored = true;
  }

  get hasProfileImage(): boolean {
    return Boolean(this.profileImageUrl) && !this.isProfileImageErrored;
  }

  private setProfileImage(details?: PersonalData): void {
    const candidate = typeof details?.imageUrl === 'string' ? details.imageUrl.trim() : '';
    this.profileImageUrl = candidate;
    this.isProfileImageErrored = false;
  }
}
