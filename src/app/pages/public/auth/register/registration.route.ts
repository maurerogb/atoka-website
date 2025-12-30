import { Routes, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { RegisterComponent } from './register.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { CreatePasswordComponent } from './create-password/create-password.component';
import { ProfilePictureComponent } from './profile-picture/profile-picture.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { RegistrationService } from '../../../../services/registration.service';
import { RegistrationStep } from '../../../../model/enums';

const navigateToCurrentStep = (router: Router, step: RegistrationStep) => {
  switch (step) {
    case RegistrationStep.PersonalInformationCompleted:
      router.navigate(['register', 'create-password']);
      break;
    case RegistrationStep.CreatePasswordCompleted:
      router.navigate(['register', 'profile-picture']);
      break;
    case RegistrationStep.ProfilePictureCompleted:
      router.navigate(['register', 'welcome']);
      break;
    default:
      router.navigate(['register', 'personal-information']);
      break;
  }
};

export const canMatchPersonalInformation: CanMatchFn = () => {
  const registration = inject(RegistrationService);
  const router = inject(Router);
  const step = registration.getStep();

  // Only allow personal-information when registration has not started.
  if (step !== RegistrationStep.None) {
    navigateToCurrentStep(router, step);
    return false;
  }
  return true;
};

export const canMatchCreatePassword: CanMatchFn = () => {
  const registration = inject(RegistrationService);
  const router = inject(Router);
  const step = registration.getStep();

  // Require personal-information to be completed, and disallow going back once beyond this step.
  if (step === RegistrationStep.PersonalInformationCompleted) {
    return true;
  }

  navigateToCurrentStep(router, step);
  return false;
};

export const canMatchProfilePicture: CanMatchFn = () => {
  const registration = inject(RegistrationService);
  const router = inject(Router);
  const step = registration.getStep();

  // Require create-password to be completed, and disallow going back once beyond this step.
  if (step === RegistrationStep.CreatePasswordCompleted) {
    return true;
  }

  navigateToCurrentStep(router, step);
  return false;
};

export const canMatchWelcome: CanMatchFn = () => {
  const registration = inject(RegistrationService);
  const router = inject(Router);
  const step = registration.getStep();

  // Only allow welcome once profile picture step is completed.
  if (step === RegistrationStep.ProfilePictureCompleted) {
    return true;
  }

  navigateToCurrentStep(router, step);
  return false;
};

export const REGISTRATION_ROUTES: Routes = [
  {
    path: '',
    component: RegisterComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'personal-information',
      },
      {
        path: 'personal-information',
        component: PersonalInformationComponent,
        canMatch: [canMatchPersonalInformation],
      },
      {
        path: 'create-password',
        component: CreatePasswordComponent,
        canMatch: [canMatchCreatePassword],
      },
      {
        path: 'profile-picture',
        component: ProfilePictureComponent,
        canMatch: [canMatchProfilePicture],
      },
    ],
  },    
  {
    path: 'welcome',
    component: WelcomeComponent,
    canMatch: [canMatchWelcome],
  }
];
