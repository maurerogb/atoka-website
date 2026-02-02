export interface INavItem {
  name: string;
  routerLink: string;
  exact?: boolean;
  activeIcon: string;
  inactiveIcon: string;
  title?: string;
  description?: string;
  showAddressVerificationButton?: boolean;
}

export interface INavContent {
  topNav: INavItem[];
  bottomNav: INavItem[];
  hasProfileDisplay: boolean;
  description?: string;
}
