import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressVerificationComponent } from './address-verification.component';

describe('AddressVerificationComponent', () => {
  let component: AddressVerificationComponent;
  let fixture: ComponentFixture<AddressVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddressVerificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddressVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
