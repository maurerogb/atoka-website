import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectEmployeeComponent } from './reject-employee.component';

describe('RejectEmployeeComponent', () => {
  let component: RejectEmployeeComponent;
  let fixture: ComponentFixture<RejectEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectEmployeeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RejectEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
