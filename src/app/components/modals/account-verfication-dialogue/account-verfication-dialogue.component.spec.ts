import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountVerficationDialogueComponent } from './account-verfication-dialogue.component';

describe('AccountVerficationDialogueComponent', () => {
  let component: AccountVerficationDialogueComponent;
  let fixture: ComponentFixture<AccountVerficationDialogueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountVerficationDialogueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountVerficationDialogueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
