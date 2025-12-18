import { Component, Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  menu = false;
  list = false;

  showMenu(){
    this.menu = true
  }
  
  isParentActive: boolean = false;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkActiveState();
    });
  }

  closeMenu(): void {
    this.menu = false;
  }

  showList(){
    this.list = true
  }

  closeList(): void {
    this.list = false;
  }

  checkActiveState() {
    // Check if the current route matches the parent route or any of its child routes
    this.isParentActive = this.router.url.startsWith('/products');
  }
}
