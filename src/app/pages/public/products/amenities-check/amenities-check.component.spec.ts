import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmenitiesCheckComponent } from './amenities-check.component';

describe('AmenitiesCheckComponent', () => {
  let component: AmenitiesCheckComponent;
  let fixture: ComponentFixture<AmenitiesCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmenitiesCheckComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AmenitiesCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
