import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyFormGenerator } from './form-generator.component';

describe('MyFormGenerator', () => {
  let component: MyFormGenerator;
  let fixture: ComponentFixture<MyFormGenerator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyFormGenerator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyFormGenerator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
