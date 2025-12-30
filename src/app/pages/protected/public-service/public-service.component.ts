import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-public-service',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-service.component.html',
  styleUrl: './public-service.component.scss',
})
export class PublicServiceComponent {}

