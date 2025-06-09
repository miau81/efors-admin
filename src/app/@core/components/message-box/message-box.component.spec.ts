import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMessageBox } from './message-box.component';

describe('MyMessageBox', () => {
  let component: MyMessageBox;
  let fixture: ComponentFixture<MyMessageBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyMessageBox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyMessageBox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
