import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../../services/authentication.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  template: '',
})
export class LogoutComponent implements OnInit {
  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.authService.logout();
  }
}
