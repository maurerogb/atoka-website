import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { DashboardService } from '../../../../services/dashboard.service';
import { DashboardCardComponent } from "../../../../components/dashboard-card/dashboard-card.component";

@Component({
  selector: 'app-business-dashboard',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    DashboardCardComponent
],
  templateUrl: './business-dashboard.component.html',
  styleUrl: './business-dashboard.component.scss'
})
export class BusinessDashboardComponent {

  userId: any;
  visit: any
  constructor(
    private dashboardService : DashboardService,
    private router : Router
  ){}

  ngOnInit(): void{
    this.userId = localStorage.getItem('userId');
  }

  getRecentVisit(){
    this.dashboardService.getRecentVisit(this.userId).subscribe((res: any)=>{
      this.visit = res.data.slice(0,3)
    })
  }
}
