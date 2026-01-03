import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ACCOUNT_NAV_CONFIG } from './account-nav.config';
import { INavContent } from '../../../model/nav';

@Component({
  selector: 'app-account-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule],
  templateUrl: './account-shell.component.html',
  styleUrl: './account-shell.component.scss',
})
export class AccountShellComponent {
  navItems: INavContent = { topNav: [], bottomNav: [], hasProfileDisplay: false, description: '' };
  title = '';
  description = '';
  showNav = false;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      const accountType = (data['accountType'] as string) ?? '';
      this.title = (data['title'] as string) ?? this.formatAccountType(accountType);
      this.navItems = ACCOUNT_NAV_CONFIG[accountType] ?? [];
      this.description = this.navItems.description ?? '';
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

  openNav() {
    this.showNav = !this.showNav
  }
  
  toggle() {
    document.getElementById('sidebar')?.classList.toggle("showSidebar")
  }
}
