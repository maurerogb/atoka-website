import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.scss'],
})
export class DashboardCardComponent {
  @Input() title = '';
  @Input() value: string = '0';
  @Input() percentage: string | number = 0;
  @Input() direction: 'up' | 'down' = 'down';
}

