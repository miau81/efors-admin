import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataGridviewComponent } from './data-gridview.component';

describe('DataGridviewComponent', () => {
  let component: DataGridviewComponent;
  let fixture: ComponentFixture<DataGridviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataGridviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataGridviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
