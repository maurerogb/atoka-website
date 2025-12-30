import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateAddressComponent } from './validate-address.component';

describe('ValidateAddressComponent', () => {
  let component: ValidateAddressComponent;
  let fixture: ComponentFixture<ValidateAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateAddressComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ValidateAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
