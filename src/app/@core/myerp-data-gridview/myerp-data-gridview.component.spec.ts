import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyerpDataGridviewComponent } from './myerp-data-gridview.component';

describe('MyerpDataGridviewComponent', () => {
  let component: MyerpDataGridviewComponent;
  let fixture: ComponentFixture<MyerpDataGridviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyerpDataGridviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyerpDataGridviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
