import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyerpDialogComponent } from './myerp-dialog.component';

describe('MyerpDialogComponent', () => {
  let component: MyerpDialogComponent;
  let fixture: ComponentFixture<MyerpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyerpDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyerpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
