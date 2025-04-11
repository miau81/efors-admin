import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SyetemSettingsComponent } from './syetem-settings.component';

describe('SyetemSettingsComponent', () => {
  let component: SyetemSettingsComponent;
  let fixture: ComponentFixture<SyetemSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SyetemSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SyetemSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
