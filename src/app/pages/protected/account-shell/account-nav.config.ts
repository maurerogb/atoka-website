import { INavContent } from '../../../model/nav';

export const ACCOUNT_NAV_CONFIG: Record<string, INavContent> = {
  tenant: {    
    description: 'Measuring your advertising ROI and track and report website traffic.',
    topNav: [
      {
        name: 'Dashboard',
        routerLink: '/app/tenant',
        exact: true,
        activeIcon: 'assets/svg/dashboard.svg',
        inactiveIcon: 'assets/svg/dashboard-inactive.svg',
      },
      {
        name: 'Location',
        routerLink: '/app/tenant/location',
        activeIcon: 'assets/svg/location.svg',
        inactiveIcon: 'assets/svg/location.svg',
      },
      {
        name: 'Incident',
        routerLink: '/app/tenant/incident',
        activeIcon: 'assets/svg/incident.svg',
        inactiveIcon: 'assets/svg/incident.svg',
      },
      {
        name: 'Tenant',
        routerLink: '/app/tenant/tenant',
        activeIcon: 'assets/svg/tenant.svg',
        inactiveIcon: 'assets/svg/tenant.svg',
      },
      {
        name: 'Address Verification',
        routerLink: '/app/public-service/address-verification',
        activeIcon: 'assets/svg/address-verification.svg',
        inactiveIcon: 'assets/svg/address-verification.svg',
      },
    ],
    bottomNav: [
      {
        name: 'Settings',
        routerLink: '/app/tenant/settings',
        activeIcon: 'assets/svg/Setting.svg',
        inactiveIcon: 'assets/svg/Setting.svg',
      },
      {
        name: 'Logout',
        routerLink: '/logout',
        activeIcon: 'assets/svg/Logout.svg',
        inactiveIcon: 'assets/svg/Logout.svg',
      }
    ],
    hasProfileDisplay: false,
  },
  user: {
    description: 'Measuring your advertising ROI and track and report website traffic.',
    topNav: [
      {
        name: 'Dashboard',
        routerLink: '/app/user',
        exact: true,
        activeIcon: 'assets/svg/dashboard.svg',
        inactiveIcon: 'assets/svg/dashboard-inactive.svg',
      },
      {
        name: 'Location',
        routerLink: '/app/user/location',
        activeIcon: 'assets/svg/location.svg',
        inactiveIcon: 'assets/svg/location.svg',
      },
      {
        name: 'Incident',
        routerLink: '/app/user/incident',
        activeIcon: 'assets/svg/incident.svg',
        inactiveIcon: 'assets/svg/incident.svg',
      },
      {
        name: 'Address Verification',
        routerLink: '/app/user/address-verification',
        activeIcon: 'assets/svg/address-verification.svg',
        inactiveIcon: 'assets/svg/address-verification.svg',
      }
    ],
    bottomNav: [
      {
        name: 'Settings',
        routerLink: '/app/user/settings',
        activeIcon: 'assets/svg/Setting.svg',
        inactiveIcon: 'assets/svg/Setting.svg',
      },
      {
        name: 'Logout',
        routerLink: '/logout',
        activeIcon: 'assets/svg/Logout.svg',
        inactiveIcon: 'assets/svg/Logout.svg',
      }
    ],
    hasProfileDisplay: false,
  },
  'business-account': {
    description: 'Measuring your advertising ROI and track and report website traffic.',
    topNav: [
      {
        name: 'Dashboard',
        routerLink: '/app/business-account',
        exact: true,
        activeIcon: 'assets/svg/dashboard.svg',
        inactiveIcon: 'assets/svg/dashboard-inactive.svg',
      },
      {
        name: 'Location',
        routerLink: '/app/business-account/location',
        activeIcon: 'assets/svg/location.svg',
        inactiveIcon: 'assets/svg/location.svg',
      },
      {
        name: 'Incident',
        routerLink: '/app/business-account/incident',
        activeIcon: 'assets/svg/incident.svg',
        inactiveIcon: 'assets/svg/incident.svg',
      },
      {
        name: 'Confirm Request',
        routerLink: '/app/business-account/employees',
        activeIcon: 'assets/svg/employee.svg',
        inactiveIcon: 'assets/svg/employee.svg',
      },
      {
        name: 'Branch',
        routerLink: '/app/business-account/branch',
        activeIcon: 'assets/svg/branch.svg',
        inactiveIcon: 'assets/svg/branch.svg',
      },
      // {
      //   name: 'Manager/Owner',
      //   routerLink: '/app/tenant/tenant',
      //   activeIcon: 'assets/svg/employee.svg',
      //   inactiveIcon: 'assets/svg/employee.svg',
      // }
      
      {
        name: 'Address Verification',
        routerLink: '/app/business-account/address-verification',
        activeIcon: 'assets/svg/address-verification.svg',
        inactiveIcon: 'assets/svg/address-verification.svg',
      },
    ],
    bottomNav: [
      {
        name: 'Settings',
        routerLink: '/app/business-account/settings',
        activeIcon: 'assets/svg/Setting.svg',
        inactiveIcon: 'assets/svg/Setting.svg',
      },
      {
        name: 'Logout',
        routerLink: '/signin',
        activeIcon: 'assets/svg/Logout.svg',
        inactiveIcon: 'assets/svg/Logout.svg',
      }
    ],
    hasProfileDisplay: true
  },
  'public-service': {
    description: 'Measuring your advertising ROI and track and report website traffic.',
    topNav: [
      {
        name: 'Dashboard',
        routerLink: '/app/public-service',
        exact: true,
        activeIcon: 'assets/svg/dashboard.svg',
        inactiveIcon: 'assets/svg/dashboard-inactive.svg',
      },
      {
        name: 'Location',
        routerLink: '/app/public-service/location',
        activeIcon: 'assets/svg/location.svg',
        inactiveIcon: 'assets/svg/location.svg',
      },
      {
        name: 'Incident',
        routerLink: '/app/public-service/incident',
        activeIcon: 'assets/svg/incident.svg',
        inactiveIcon: 'assets/svg/incident.svg',
      },
      {
        name: 'Urban Planning',
        routerLink: '/app/public-service/urban-planning',
        activeIcon: 'assets/svg/urban-planning.svg',
        inactiveIcon: 'assets/svg/urban-planning.svg',
      },
      {
        name: 'Social Amenities',
        routerLink: '/app/public-service/social-amenities',
        activeIcon: 'assets/svg/amenities.svg',
        inactiveIcon: 'assets/svg/amenities.svg',
      },
      {
        name: 'Business',
        routerLink: '/app/public-service/business',
        activeIcon: 'assets/svg/business.svg',
        inactiveIcon: 'assets/svg/business.svg',
      },
      {
        name: 'Address Verification',
        routerLink: '/app/public-service/address-verification',
        activeIcon: 'assets/svg/address-verification.svg',
        inactiveIcon: 'assets/svg/address-verification.svg',
      },
    ],
    bottomNav: [
      {
        name: 'Settings',
        routerLink: '/app/public-service/settings',
        activeIcon: 'assets/svg/Setting.svg',
        inactiveIcon: 'assets/svg/Setting.svg',
      },
      {
        name: 'Logout',
        routerLink: '/logout',
        activeIcon: 'assets/svg/Logout.svg',
        inactiveIcon: 'assets/svg/Logout.svg',
      }
    ],
    hasProfileDisplay: false
  },
};
