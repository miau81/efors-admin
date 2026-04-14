import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output, inject, signal, effect, input, output } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormArray, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MyTranslatePipe } from '../../pipes';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgSelectComponent, NgOptionComponent } from '@ng-select/ng-select';

import { MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { MyMedia } from '../media/media.component';
import { MyDatePicker } from '../date-picker/date-picker.component';
import { MyFormComponent, MyFormGenerator, MyFormGeneratorConfig } from '../form-generator/form-generator.component';

@Component({
  selector: 'myerp-editable-table',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MyTranslatePipe,
    TranslateModule,
    MyMedia,
    NgSelectComponent,
    NgOptionComponent,
    MyDatePicker,
    MatDialogModule,
  ],
  providers: [DecimalPipe],
  templateUrl: './editable-table.component.html',
  styleUrl: './editable-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyEditableTable {
  // Using input() from Angular 17+
  formArray = input.required<FormArray>();
  component = input.required<MyFormComponent>();
  formConfig = input.required<MyFormGeneratorConfig>();
  readOnly = input.required<boolean>();

  // Using output() from Angular 17+ 
  componentChange = output<MyFormComponent>();
  onFormChange = output<any>();
  onFormKeyUp = output<any>();
  onOpenForm = output<any>();
  onViewLinkDoc = output<any>();
  onRowChange = output<any>();

  // Signals for internal state
  readonly rows = signal<any[]>([]);

  // DI using inject()
  private readonly cd = inject(ChangeDetectorRef);
  private readonly translateService = inject(TranslateService);
  private readonly decimalPipe = inject(DecimalPipe);

  constructor() {
    // Removed the effect that was causing unnecessary change detection
    // The effect was triggering markForCheck on every row change
    // which was happening on every input change in the table
  }

  ngOnInit() {
    this.formArray().valueChanges.subscribe((r) => {
      this.component().value = r;
      this.refreshRow();
    });
    this.refreshRow();
  }

  refreshRow() {
    const newRows: any[] = [];
    const comp = this.component();

    for (const v of comp?.value || []) {
      for (const c of comp.tableConfig?.displayColumns || []) {
        if (c.component.type === 'currency') {
          v[c.component.key] = this.getCurrencyValue(v[c.component.key]);
        }
      }
      this.addRowInternal(newRows);
    }
    // Use markForCheck instead of directly setting the signal
    // to prevent unnecessary change detection cycles
    this.rows.set(newRows);
    this.cd.markForCheck();
  }

  private addRowInternal(newRows: any[]) {
    const comp = this.component();
    const cols: any[] = [];
    for (const c of comp.tableConfig?.displayColumns || []) {
      const component = JSON.parse(JSON.stringify(c.component));
      cols.push({ component: component, isCheck: false });
    }
    newRows.push({ cols });
  }

  onKeyUp(component: MyFormComponent, e: KeyboardEvent, index: number): void {
    this.onFormKeyUp.emit({ component: component, event: e, index: index });
  }

  onChange(component: MyFormComponent, index: number): void {
    const comp = this.component();
    if (component.type === 'currency') {
      comp.value[index][component.key] = this.getCurrencyValue(comp.value[index][component.key]);
    }
    this.onFormChange.emit({ row: this.rows()[index], component: component, values: comp.value, index: index });
  }

  getCurrencyValue(value: any): string {
    return this.decimalPipe.transform(value, "1.2-2") || '';
  }

  onImageClick(component: MyFormComponent, index: number) {
    const element = document.getElementById(component.key);
    element?.click();
  }

  onRemoveImage(component: MyFormComponent, index?: number) {
    this.onFormChange.emit(component);
  }

  onImageError(e: any, component: MyFormComponent, index?: number) {
    e.target.src = component.imageConfig?.defaultImage;
  }

  onFileSelected(e: any, component: MyFormComponent, index: number) {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        component.value = event.target.result;
        this.onChange(component, index);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  onDatePickerChange(component: MyFormComponent, dt: any, index: number) {
    this.onChange(component, index);
  }

  onCheckAll(event: any) {
    this.component().value?.forEach((d: any) => d.isCheck = event.target.checked);
  }

  setupFormComponent(c: MyFormComponent, group: any): any {
    let validators: any[] = [];
    if (c.required) {
      validators.push(Validators.required);
    }
    if (c.type === "table") {
      group[c.key] = new FormArray([], validators);
    }
    if (c.type === "email") {
      validators.push(Validators.email);
    }
    if (c.type === "number") {
      validators.push(Validators.min);
      validators.push(Validators.max);
    }
    if (c.type === "checkboxGroup") {
      group[c.key] = new FormArray([], validators);
    } else {
      if (c.type !== "breakline") {
        group[c.key] = new FormControl({ value: c.value, disabled: !!(c.readonly || c.disabled) }, validators);
      }
    }
    return group;
  }

  onAddRow(isNew?: any) {
    const comp = this.component();
    if (isNew) {
      comp.value = comp.value || [];
      const defaultValue: any = {};
      for (const c of comp.tableConfig?.displayColumns || []) {
        if (c.component.type === 'currency') {
          defaultValue[c.component.key] = this.getCurrencyValue(c.defaultValue);
        } else {
          defaultValue[c.component.key] = c.defaultValue;
        }
      }
      comp.value.push(defaultValue);
    }
    this.addRowInternal(this.rows());
    if (isNew) {
      this.onRowChange.emit(undefined);
    }
  }

  async onModalForm(index: number) {
    const formConfig = JSON.parse(JSON.stringify(this.formConfig()));
    formConfig.initValue = this.component().value[index];
    const title = await firstValueFrom(this.translateService.get("_EDIT_ROW", { row: index + 1 }));

    const callback = (res: any) => {
      if (this.formConfig().readOnly) {
        return;
      }
      if (res.isRemove) {
        this.onRemoveRow(index);
      } else {
        this.component().value[index] = res.value;
      }
      this.onChange(this.component(), index);
    };

    this.onOpenForm.emit({
      title: title,
      document: this.component().value[index],
      callback: callback
    });
  }

  onRemoveRow(index: number) {
    this.component().value?.splice(index, 1);
    this.refreshRow();
    this.onRowChange.emit(undefined);
  }

  multiNgSwitchCase(arr: string[], type: string): boolean {
    return arr.some(a => a === type);
  }

  onViewDocumentClick(event: any) {
    this.onViewLinkDoc.emit(event);
  }
}
