import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-card-mini',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './dashboard-card-mini.component.html',
  styleUrls: ['./dashboard-card-mini.component.scss'],
})
export class DashboardCardMiniComponent {
  @Input() title = '';
  @Input() value: string = '0';
  @Input() percentage: string | number = 0;
  @Input() direction: 'up' | 'down' = 'down';
}

