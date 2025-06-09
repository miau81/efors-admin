import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMedia } from './media.component';

describe('MyMedia', () => {
  let component: MyMedia;
  let fixture: ComponentFixture<MyMedia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyMedia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyMedia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
