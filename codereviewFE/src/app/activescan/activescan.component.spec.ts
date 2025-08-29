import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivescanComponent } from './activescan.component';

describe('ActivescanComponent', () => {
  let component: ActivescanComponent;
  let fixture: ComponentFixture<ActivescanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivescanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivescanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
