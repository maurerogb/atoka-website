import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../../services/dashboard.service';
import { DashboardCardComponent } from '../../../../components/dashboard-card/dashboard-card.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    DashboardCardComponent
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent {
  userId: any;
  visit: any
  constructor(
    private dashboardService : DashboardService,
    private router : Router
  ){}

  ngOnInit(): void{
    this.userId = localStorage.getItem('userId');
    this.getRecentVisit()
  }

  getRecentVisit(){
    this.dashboardService.getRecentVisit(this.userId).subscribe((res: any)=>{
      this.visit = res.data.slice(0,3)
      console.log(res)
    })
  }

  goToEmployeePage(){
    this.router.navigateByUrl('/app/business-account/employees')
  }
}
