import { Component, EventEmitter, inject, Input, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgSelectComponent, NgOptionComponent } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { getTranslateJSON } from '@myerp/utils/misc';
import { MyTranslatePipe } from '@myerp/pipes';

import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormArray, FormControl, FormGroup } from '@angular/forms';
import { MyMedia } from '../media/media.component';
import { MyDatePicker } from '../date-picker/date-picker.component';
import { MyEditableTable } from '../editable-table/editable-table.component';
import { NgxCurrencyDirective } from "ngx-currency";
import dayjs from 'dayjs';

@Component({
  selector: 'myerp-form-generator',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MyMedia,
    MyDatePicker,
    MyTranslatePipe,
    MatTabsModule,
    MatExpansionModule,
    NgSelectComponent,
    NgOptionComponent,
    TranslateModule,
    MyEditableTable,
    NgxCurrencyDirective
  ],
  templateUrl: './form-generator.component.html',
  styleUrl: './form-generator.component.scss'
})
export class MyFormGenerator {

  @Input() config!: MyFormGeneratorConfig;
  public dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  public dialogRef = inject(MatDialogRef<MyFormGenerator>, { optional: true });
  public ready = false;
  public doneSetupForm: boolean = false;
  @Output("onFormReady") onFormReady: EventEmitter<any> = new EventEmitter();
  @Output("onChange") onFormChange: EventEmitter<any> = new EventEmitter();
  @Output("onKeyUp") onFormKeyUp: EventEmitter<any> = new EventEmitter();
  @Output("onViewLinkDoc") onViewLinkDoc: EventEmitter<any> = new EventEmitter();
  @Output("openTableForm") openTableForm: EventEmitter<any> = new EventEmitter();
  @Output("removeTableRow") removeTableRow: EventEmitter<any> = new EventEmitter();


  _PLEASE_INSERT_VALID_VALUE: string = getTranslateJSON("_PLEASE_INSERT_VALID_VALUE");


  constructor(
    private fb: FormBuilder, private dialog: MatDialog) {

  }

  ngOnInit() {
    this.initValue(this.config.initValue);
    if (!this.config.form) {
      this.setupForm();
    }
    this.config.generator = this;
    this.doneSetupForm = true;
    console.log(this.config)
  }

  ngOnChanges(changes: SimpleChanges) {

    // const change = changes["config"];
    // this.config.components=this.config.components.map(c=>{return {...c,value:c.value}})
  }

  initValue(value: any) {
    if (!value) {
      return;
    }
    for (let key of Object.keys(value)) {
      const component = this.findComponentByKey(key);
      if (component) {
        component.value = value[key]
      };
    }
  }

  findComponentByKey(key: string) {
    for (const t of this.config.tabs) {
      for (const s of t.sections) {
        const component = s.components.find(c => c.key == key);
        if (component) {
          return component;
        }
      }
    }
    return null;
  }

  setupForm() {
    let group: any = {};
    this.config.tabs.forEach(t => {
      t.sections.forEach(s => {
        s.components.forEach((c: MyFormComponent) => {
          group = this.setupFormComponent(c, group)
        });
      })
    })
    this.config.form = this.fb.group(group);
    this.onFormReady.emit();
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
        if (c.type == "datetime-local") {
          console.log(c.value)
          const date = dayjs(c.value).format("YYYY-MM-DDThh:mm:ss")
          group[c.key] = new FormControl(date, validators);
        } else {
          group[c.key] = new FormControl({ value: c.value, disabled: c.disabled }, validators);
        }

      }
    }
    return group;
  }

  onDatePickerChange(component: MyFormComponent, dt: any) {
    this.config.form.controls[component.key].setValue(dt);
    this.onChange(component);
  }

  onKeyUp(component: MyFormComponent, e?: KeyboardEvent): void {
    component.value = this.config.form.controls[component.key].value;
    this.onFormKeyUp.emit({ component: component, event: e });
  }

  async onChange(component: MyFormComponent, e?: any, index?: number) {
    if (component.type == "checkboxGroup") {
      const formArray: FormArray = this.config.form.get(component.key) as FormArray;
      if (e.target.checked) {
        formArray.push(this.fb.control(e.target.value));
      } else {
        const index = formArray.controls.findIndex(x => x.value === e.target.value);
        formArray.removeAt(index);
      }
    } else {
      if (component.type != "image") {
        component.value = this.config.form.controls[component.key].value;
      }
    }
    this.onFormChange.emit({ component: component, isInit: false });
  }



  multiNgSwitchCase(arr: string[], type: string): boolean {
    return arr.find(a => a == type) ? true : false;
  }

  onShowPassword(component: MyFormComponent) {
    if (component.passwordConfig) {
      component.passwordConfig.showPassword = !component.passwordConfig.showPassword
    }
  }

  validateForm() {
    this.config.form.markAllAsTouched();
    return this.config.form.valid;
  }

  getErrorFormControlKeys() {
    const controls = this.config.form.controls
    const invalidControls:any = {};
    for (const key of Object.keys(controls)) {
      if (controls[key].invalid) {
        invalidControls[key] = controls[key];
      }
    }
    return invalidControls;
  }

  onImageClick(component: MyFormComponent) {
    const element = document.getElementById(component.key);
    element?.click();
  }

  onRemoveImage(component: MyFormComponent) {
    this.config.form.controls[component.key].reset();
    component.value = this.config.form.controls[component.key].value;
    this.onFormChange.emit({ component: component });
  }

  onFileSelected(e: any, component: MyFormComponent) {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (event: any) => {
        component.value = event.target.result;
        // try {
        this.config.form.controls[component.key].setValue(e.target.files[0]);
        this.config.form.controls[component.key].updateValueAndValidity()
        // } catch {

        // }
        this.onChange(component);

      };
      reader.readAsDataURL(e.target.files[0]);
    }

  }

  onImageError(e: any, component: MyFormComponent) {
    e.target.src = component.imageConfig?.defaultImage;
  }

  resetForm() {
    for (const tab of this.config.tabs) {
      for (const section of tab.sections) {
        for (let component of section.components) {
          switch (component.type) {
            case "checkboxGroup":
              component.options = component.options?.map(o => { return { ...o, checked: false } });
              break;
            case "datePicker":
              component.value = undefined;
          }
        }
      }
    }

    this.config.form.reset();
  }

  onChildTableChange(change: { index: number, row: any, component: MyFormComponent, values: any[] }, component: MyFormComponent) {
    this.config.form.controls[component.key].setValue(change.values);
    this.onFormChange.emit({ component: component, isInit: false, childTable: { row: change.row, component: change.component, index: change.index, isInit: false } });
  }

  onRemoveTableRow() {
    this.removeTableRow.emit();
  }

  async onOpenTableForm(event: any, component: MyFormComponent) {
    const options = {
      title: event.title,
      document: event.document,
      component: component,
      callback: event.callback
    }
    // request.callback(res);
    this.openTableForm.emit(options)
    // this.onFormChange.emit(request)
  }

  onSave() {
    if (!this.validateForm()) {
      return;
    }
  }

  onViewDocumentClick(event: any) {
    this.onViewLinkDoc.emit(event);
  }

  getChildTableFromArray(key: string) {
    return this.config.form.get(key) as FormArray;
  }

}

export interface MyFormGeneratorConfig {
  form: FormGroup;
  // components: MyFormComponent[];
  tabs: MyFormTab[];
  generator?: MyFormGenerator;
  initValue?: { [key: string]: any };
  showValidation?: boolean;
}

export interface FormKeyboardEvent {
  component: MyFormComponent,
  event: KeyboardEvent;
}

export interface MyFormTab {
  key: string;
  label?: string;
  sections: MyFromSection[];
}

export interface MyFromSection {
  key: string;
  label?: string;
  sectionExpanded?: boolean;
  components: MyFormComponent[];
}

export interface MyFormComponent {
  key: string;
  label?: string;
  col?: string;
  type: MyFormComponentType;
  color?: "primary" | "secondary" | "light" | "dark" | "success" | "warning" | "danger" | "tertiary" | "medium";
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  value?: any;
  options?: { label: string, value: any, checked?: boolean }[];
  sortOrder?: number;
  dateTimeConfig?: {
    // selectType: IonDatetime["presentation"],
    endOfMonth?: boolean;
    endOfDay?: boolean;
    format?: string;
    min?: string;
    max?: string;
  };
  passwordConfig?: {
    showPassword?: boolean;
    showHide?: boolean;
    minlength?: number;
    maxlength?: number;
  };
  inputConfig?: {
    minlength?: number;
    maxlength?: number;
  };
  numberConfig?: {
    min?: number;
    max?: number;
    step?: number;
  };
  selectConfig?: {
    interface?: "popover" | "action-sheet";
    multiple?: boolean;
    canAddNew?: boolean;
    canEdit?: boolean;
    canView?: Boolean;
    formConfig?: MyFormGeneratorConfig;
  };
  textareaConfig?: {
    rows: number;
  };
  imageConfig?: {
    width?: number;
    height?: number;
    defaultImage?: string;
  }
  tableConfig?: {
    displayColumns: MyFormChildTableColumn[];
    columns: MyFormChildTableColumn[];
    formConfig: MyFormGeneratorConfig;
  }
}

export interface MyFormChildTableColumn {
  key: string,
  label: string;
  component: MyFormComponent;
  required?: boolean,
  defaultValue: any
}

export type MyFormComponentType = "text" | "password" | "email" | "number" | "tel" | "select" | "date" | "time"
  | "datetime-local" | "hidden" | "checkbox" | 'readOnly' | 'textarea' | 'currency' | 'readOnlyCurrency'
  | "checkboxGroup" | "datePicker" | "image" | "table" | "link" | "dropdown" | "breakline"
