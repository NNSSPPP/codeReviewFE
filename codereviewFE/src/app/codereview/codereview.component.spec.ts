import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodereviewComponent } from './codereview.component';

describe('CodereviewComponent', () => {
  let component: CodereviewComponent;
  let fixture: ComponentFixture<CodereviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodereviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodereviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
