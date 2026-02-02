import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ACCOUNT_NAV_CONFIG } from './account-nav.config';
import { INavContent, INavItem } from '../../../model/nav';

@Component({
  selector: 'app-account-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './account-shell.component.html',
  styleUrl: './account-shell.component.scss',
})
export class AccountShellComponent implements OnDestroy {
  navItems: INavContent = { topNav: [], bottomNav: [], hasProfileDisplay: false, description: '' };
  title = '';
  description = '';
  showAddressVerificationButton = false;
  addressVerificationLink = '';
  showNav = false;
  private baseTitle = '';
  private baseDescription = '';
  private readonly subscriptions = new Subscription();

  constructor(private route: ActivatedRoute, private router: Router) {
    this.subscriptions.add(
      this.route.data.subscribe((data) => {
        const accountType = (data['accountType'] as string) ?? '';
        this.baseTitle = (data['title'] as string) ?? this.formatAccountType(accountType);
        this.navItems = ACCOUNT_NAV_CONFIG[accountType] ?? {
          topNav: [],
          bottomNav: [],
          hasProfileDisplay: false,
        };
        this.baseDescription = this.navItems.description ?? '';
        this.addressVerificationLink = this.findAddressVerificationLink();
        this.updateHeaderForUrl(this.router.url);
      })
    );

    this.subscriptions.add(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe((event) => {
          this.updateHeaderForUrl(event.urlAfterRedirects);
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  private updateHeaderForUrl(url: string): void {
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

      const isMatch = item.exact
        ? normalizedUrl === normalizedLink
        : normalizedUrl === normalizedLink || normalizedUrl.startsWith(`${normalizedLink}/`);

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
}
