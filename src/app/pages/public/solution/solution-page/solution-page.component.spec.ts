import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionPageComponent } from './solution-page.component';

describe('SolutionPageComponent', () => {
  let component: SolutionPageComponent;
  let fixture: ComponentFixture<SolutionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolutionPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SolutionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
