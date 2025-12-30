import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from "@angular/router";
import { RegistrationService } from '../../../../services/registration.service';
import { RegistrationStep } from '../../../../model/enums';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registrationStepEnum = RegistrationStep;

  constructor(private registrationService: RegistrationService) {}

  get registrationStep(): RegistrationStep {
    return this.registrationService.getStep();
  }
}
