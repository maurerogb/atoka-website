import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicServiceDashboardComponent } from './public-service-dashboard.component';


describe('PublicServiceDashboardComponent', () => {
  let component: PublicServiceDashboardComponent;
  let fixture: ComponentFixture<PublicServiceDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicServiceDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PublicServiceDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
