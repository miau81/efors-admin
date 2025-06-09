import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDatePicker } from './date-picker.component';

describe('MyDatePicker', () => {
  let component: MyDatePicker;
  let fixture: ComponentFixture<MyDatePicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyDatePicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyDatePicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
