import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { IconRegistryService } from './services/icon-registry.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'atoka-web';
  
  constructor(
    private iconService: IconRegistryService,
  ) {
    this.iconService.setIcons();
  }
}
