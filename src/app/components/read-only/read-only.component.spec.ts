import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadOnlyComponent } from './read-only.component';

describe('ReadOnlyComponent', () => {
  let component: ReadOnlyComponent;
  let fixture: ComponentFixture<ReadOnlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadOnlyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReadOnlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
