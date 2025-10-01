import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormArray, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MyTranslatePipe } from '@myerp/pipes';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgSelectComponent, NgOptionComponent } from '@ng-select/ng-select';

import { MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { MyMedia } from '../media/media.component';
import { MyDatePicker } from '../date-picker/date-picker.component';
import { MyFormComponent, MyFormGenerator, MyFormGeneratorConfig } from '../form-generator/form-generator.component';
// import { NgxCurrencyDirective } from 'ngx-currency';

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
    // NgxCurrencyDirective
  ],
  providers: [DecimalPipe],
  templateUrl: './editable-table.component.html',
  styleUrl: './editable-table.component.scss'
})
export class MyEditableTable {
  @Input() formArray!: FormArray;
  @Input() component!: MyFormComponent;
  @Input() formConfig!: MyFormGeneratorConfig;
  @Output() componentChange: EventEmitter<MyFormComponent> = new EventEmitter<MyFormComponent>();
  @Output("onChange") onFormChange: EventEmitter<any> = new EventEmitter();
  @Output("onKeyUp") onFormKeyUp: EventEmitter<any> = new EventEmitter();
  @Output("onOpenForm") onOpenForm: EventEmitter<any> = new EventEmitter();
  @Output("onViewLinkDoc") onViewLinkDoc: EventEmitter<any> = new EventEmitter();
  public rows: any = [];
  constructor(private cd: ChangeDetectorRef, private translateService: TranslateService, private decimalPipe: DecimalPipe) {

  }


  ngOnInit() {
    this.formArray.valueChanges.subscribe((r) => {
      this.component.value = r;
    })
    this.refreshRow()
  }

  refreshRow() {
    this.rows = [];

    for (const v of this.component.value || []) {
      for (const c of this.component.tableConfig!.displayColumns) {
        if (c.component.type == 'currency' || c.component.type == 'readOnlyCurrency') {
          v[c.component.key] = this.getCurrencyValue(v[c.component.key]);
        }
      }
      this.onAddRow();
    }
  }

  onKeyUp(component: MyFormComponent, e: KeyboardEvent, index: number): void {
    this.onFormKeyUp.emit({ component: component, event: e, index: index });
  }

  onChange(component: MyFormComponent, index: number): void {

    if (component.type == 'currency' || component.type == 'readOnlyCurrency') {
      this.component.value[index][component.key] = this.getCurrencyValue(this.component.value[index][component.key]);
    }
    this.onFormChange.emit({ row: this.rows[index], component: component, values: this.component.value, index: index });
  }

  getCurrencyValue(value: any) {
    return this.decimalPipe.transform(value, "1.2-2");
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
      let reader = new FileReader();
      reader.onload = (event: any) => {
        component.value = event.target.result;
        // // try {
        // this.config.form.controls[component.key].setValue(e.target.files[0]);
        // this.config.form.controls[component.key].updateValueAndValidity()
        // } catch {

        // }
        this.onChange(component, index);

      };
      reader.readAsDataURL(e.target.files[0]);
    }

  }

  onDatePickerChange(component: MyFormComponent, dt: any, index: number) {
    this.onChange(component, index);
  }


  onCheckAll(event: any) {
    this.component.value.forEach((d: any) => d.isCheck = event.target.checked);
  }

  setupFormComponent(c: MyFormComponent, group: any) {
    let validators: any[] = [];
    if (c.required) {
      validators.push(Validators.required);
    }
    if (c.type == "table") {
      group[c.key] = new FormArray([], validators);
    }
    if (c.type == "email") {
      validators.push(Validators.email);
    }
    if (c.type == "number") {
      validators.push(Validators.min);
      validators.push(Validators.max);
    }
    if (c.type == "checkboxGroup") {
      group[c.key] = new FormArray([], validators);
    } else {
      if (c.type != "breakline") {
        group[c.key] = new FormControl({ value: c.value, disabled: c.disabled }, validators);
      }
    }
    return group;
  }


  onAddRow(isNew?: any) {
    if (isNew) {
      this.component.value = this.component.value || []
      const defaultValue: any = {};
      for (const c of this.component.tableConfig!.displayColumns) {
        if (c.component.type == 'currency' || c.component.type == 'readOnlyCurrency') {
          defaultValue[c.component.key] = this.getCurrencyValue(c.defaultValue);
        } else {
          defaultValue[c.component.key] = c.defaultValue;
        }
      }

      this.component.value.push(defaultValue);
    }
    const cols = []
    for (const c of this.component.tableConfig!.displayColumns) {
      const component = JSON.parse(JSON.stringify(c.component));
      cols.push({ component: component, isCheck: false });
    }
    this.rows.push({ cols });
  }

  async onModalForm(index: number) {

    const formConfig = JSON.parse(JSON.stringify(this.formConfig));
    formConfig.initValue = this.component.value[index];
    const title = await firstValueFrom(this.translateService.get("_EDIT_ROW", { row: index + 1 }));


    const callback = (res: any) => {
      if (this.formConfig.readOnly) {
        return
      }
      if (res.isRemove) {
        this.onRemoveRow(index)
      } else {
        this.component.value[index] = res.value;
      }
      this.onChange(this.component, index)
    }

    this.onOpenForm.emit({
      title: title,
      document: this.component.value[index],
      callback: callback
    })

 }

  onRemoveRow(index: number) {
    console.log(123)
    this.component.value.splice(index, 1);
    this.rows.splice(index, 1);
  }

  multiNgSwitchCase(arr: string[], type: string): boolean {
    return arr.find(a => a == type) ? true : false;
  }

  onViewDocumentClick(event: any) {
    this.onViewLinkDoc.emit(event);
  }



}
