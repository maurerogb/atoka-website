import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandlordVerificationComponent } from './landlord-verification.component';

describe('LandlordVerificationComponent', () => {
  let component: LandlordVerificationComponent;
  let fixture: ComponentFixture<LandlordVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandlordVerificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandlordVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
