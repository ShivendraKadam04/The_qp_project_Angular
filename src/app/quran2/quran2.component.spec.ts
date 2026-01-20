import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Quran2Component } from './quran2.component';

describe('Quran2Component', () => {
  let component: Quran2Component;
  let fixture: ComponentFixture<Quran2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Quran2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Quran2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
