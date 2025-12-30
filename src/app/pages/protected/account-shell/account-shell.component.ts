import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';

interface AccountNavItem {
  label: string;
  path: string;
}

const ACCOUNT_NAV_CONFIG: Record<string, AccountNavItem[]> = {
  tenant: [
    { label: 'Dashboard', path: '' },
  ],
  user: [
    { label: 'Dashboard', path: '' },
  ],
  'business-account': [
    { label: 'Dashboard', path: '' },
  ],
  'public-service': [
    { label: 'Dashboard', path: '' },
  ],
};

@Component({
  selector: 'app-account-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-shell.component.html',
  styleUrl: './account-shell.component.scss',
})
export class AccountShellComponent {
  navItems: AccountNavItem[] = [];
  title = '';

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      const accountType = (data['accountType'] as string) ?? '';
      this.title = (data['title'] as string) ?? this.formatAccountType(accountType);
      this.navItems = ACCOUNT_NAV_CONFIG[accountType] ?? [];
    });
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
}

