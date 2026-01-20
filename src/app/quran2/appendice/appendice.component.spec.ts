import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppendiceComponent } from './appendice.component';

describe('AppendiceComponent', () => {
  let component: AppendiceComponent;
  let fixture: ComponentFixture<AppendiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppendiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppendiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
