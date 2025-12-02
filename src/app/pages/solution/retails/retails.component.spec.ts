import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailsComponent } from './retails.component';

describe('RetailsComponent', () => {
  let component: RetailsComponent;
  let fixture: ComponentFixture<RetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
