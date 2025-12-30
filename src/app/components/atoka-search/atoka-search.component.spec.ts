import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtokaSearchComponent } from './atoka-search.component';

describe('AtokaSearchComponent', () => {
  let component: AtokaSearchComponent;
  let fixture: ComponentFixture<AtokaSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtokaSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AtokaSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
