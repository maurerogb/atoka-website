import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetMobileComponent } from './get-mobile.component';

describe('GetMobileComponent', () => {
  let component: GetMobileComponent;
  let fixture: ComponentFixture<GetMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GetMobileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GetMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
