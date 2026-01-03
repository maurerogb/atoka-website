export interface INavItem {
  name: string;
  routerLink: string;
  exact?: boolean;
  activeIcon: string;
  inactiveIcon: string;
}

export interface INavContent {
  topNav: INavItem[];
  bottomNav: INavItem[];
  hasProfileDisplay: boolean;
  description?: string;
}
