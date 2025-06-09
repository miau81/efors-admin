import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyEditableTable } from './editable-table.component';

describe('MyEditableTable', () => {
  let component: MyEditableTable;
  let fixture: ComponentFixture<MyEditableTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyEditableTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyEditableTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
