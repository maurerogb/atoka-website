import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  auth.logout();
  return false;
};
