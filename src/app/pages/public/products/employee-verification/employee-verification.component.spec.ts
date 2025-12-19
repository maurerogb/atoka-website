import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeVerificationComponent } from './employee-verification.component';

describe('EmployeeVerificationComponent', () => {
  let component: EmployeeVerificationComponent;
  let fixture: ComponentFixture<EmployeeVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeVerificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmployeeVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
