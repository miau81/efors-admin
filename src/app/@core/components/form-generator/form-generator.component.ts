import { Component, EventEmitter, Inject, inject, Input, Output, PLATFORM_ID, signal, effect, SimpleChanges, WritableSignal, input, output, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';
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
  ],
  providers: [DecimalPipe],
  templateUrl: './form-generator.component.html',
  styleUrl: './form-generator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyFormGenerator {
  // Using input() from Angular 17+
  config = input.required<MyFormGeneratorConfig>();

  // Using output() from Angular 17+
  onFormReady = output<any>();
  onFormChange = output<any>();
  onFormKeyUp = output<any>();
  onViewLinkDoc = output<any>();
  openTableForm = output<any>();
  removeTableRow = output<any>();

  // Using inject()
  readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  readonly dialogRef = inject(MatDialogRef<MyFormGenerator>, { optional: true });
  private readonly fb = inject(FormBuilder);
  private readonly decimalPipe = inject(DecimalPipe);
  private readonly dialog = inject(MatDialog);
  private readonly cd = inject(ChangeDetectorRef);

  // Using signals for internal state
  readonly ready = signal(false);
  readonly doneSetupForm = signal(false);

  _PLEASE_INSERT_VALID_VALUE: string = getTranslateJSON("_PLEASE_INSERT_VALID_VALUE");

  constructor() {
    // Removed the effect that was causing unnecessary change detection
    // The changeSignal was being triggered by currency field changes
    // which caused scroll resets in the document component
  }

  ngOnInit() {
    this.setDefaultTabAndSection();
    this.initValue(this.config().initValue);
    if (!this.config().form) {
      this.setupForm();
    }
    this.config().generator = this;
    this.doneSetupForm.set(true);
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  setDefaultTabAndSection() {
    const cfg = this.config();
    if (cfg.tabs.length == 0 || cfg.components.some(c => !c.group && c.type != 'hidden')) {
      cfg.tabs.push({ key: "DEFAULT_TAB" });
      cfg.sections.push({ key: "DEFAULT_SECTION", parent: "DEFAULT_TAB" });
      cfg.sections = cfg.sections.map(s => {
        return {
          ...s,
          parent: s.parent || "DEFAULT_TAB"
        }
      })
      cfg.components = cfg.components.map(c => {
        return {
          ...c,
          group: c.group || "DEFAULT_SECTION"
        }
      })
    }
    cfg.components = cfg.components.map(c => {
      return {
        ...c,
        group: c.type == 'hidden' ? cfg.sections[0].key : c.group
      }
    })
  }

  initValue(value: any) {
    if (!value) {
      return;
    }

    for (let key of Object.keys(value)) {
      const component = this.findComponentByKey(key);
      if (component) {
        if (component.type == 'currency') {
          component.value = this.getCurrencyValue(value[key]);
        } else {
          component.value = value[key];
        }
      };
    }
  }

  getCurrencyValue(value: any) {
    return this.decimalPipe.transform(value, "1.2-2");
  }

  findComponentByKey(key: string) {
    return this.config().components.find(c => c.key == key);
  }

  setupForm() {
    let group: any = {};
    const cfg = this.config();
    cfg.components.forEach((c: MyFormComponent) => {
      group = this.setupFormComponent(c, group)
      if (c.key == "items") {
        return
      }
    });
    cfg.form = this.fb.group(group);
    this.onFormReady.emit(undefined);
  }


  setupFormComponent(c: MyFormComponent, group: any) {
    let validators: any[] = [];
    if (c.required) {
      validators.push(Validators.required);
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
          const date = dayjs(c.value).format("YYYY-MM-DDThh:mm:ss")
          group[c.key] = new FormControl({ value: date, disabled: !!(c.readonly || c.disabled) }, { validators: validators });
        } else {
          group[c.key] = new FormControl({ value: c.value, disabled: !!(c.readonly || c.disabled) }, { validators: validators });
        }
      }
    }
    return group;
  }

  onDatePickerChange(component: MyFormComponent, dt: any) {
    this.config().form.controls[component.key].setValue(dt);
    this.onChange(component);
  }

  onKeyUp(component: MyFormComponent, e?: KeyboardEvent): void {
    component.value = this.config().form.controls[component.key].value;
    this.onFormKeyUp.emit({ component: component, event: e });
  }

  async onBlur(component: MyFormComponent, e?: any, index?: number) {
    // kept for backward compatibility
  }

  async onChange(component: MyFormComponent, e?: any, index?: number) {
    const cfg = this.config();
    if (component.type == "checkboxGroup") {
      const formArray: FormArray = cfg.form.get(component.key) as FormArray;
      if (e.target.checked) {
        formArray.push(this.fb.control(e.target.value));
      } else {
        const index = formArray.controls.findIndex(x => x.value === e.target.value);
        formArray.removeAt(index);
      }
    } else {
      if (component.type != "image") {
        if (component.type == 'currency') {
          const currency = this.getCurrencyValue(cfg.form.controls[component.key].value);
          component.value = currency;
          cfg.form.controls[component.key].patchValue(currency)
          // Remove this line to prevent unnecessary change detection
          // this.changeSignal.set(false)
        } else {
          component.value = cfg.form.controls[component.key].value;
        }
      }
    }
    this.onFormChange.emit({ component: component, isInit: false });
  }



  multiNgSwitchCase(arr: string[], type: string): boolean {
    return arr.some(a => a === type);
  }

  onShowPassword(component: MyFormComponent) {
    if (component.passwordConfig) {
      component.passwordConfig.showPassword = !component.passwordConfig.showPassword
    }
  }

  validateForm() {
    this.config().form.markAllAsTouched();
    return this.config().form.valid;
  }

  getErrorFormControlKeys() {
    const cfg = this.config();
    const controls = cfg.form.controls
    const invalidControls: any = {};
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
    this.config().form.controls[component.key].reset();
    component.value = this.config().form.controls[component.key].value;
    this.onFormChange.emit({ component: component });
  }

  onFileSelected(e: any, component: MyFormComponent) {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (event: any) => {
        component.value = event.target.result;
        this.config().form.controls[component.key].setValue(e.target.files[0]);
        this.config().form.controls[component.key].updateValueAndValidity()
        this.onChange(component);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  onImageError(e: any, component: MyFormComponent) {
    e.target.src = component.imageConfig?.defaultImage;
  }

  resetForm() {
    for (let component of this.config().components) {
      switch (component.type) {
        case "checkboxGroup":
          component.options = component.options?.map(o => { return { ...o, checked: false } });
          break;
        case "datePicker":
          component.value = undefined;
      }
    }
    this.config().form.reset();
  }

  onChildTableChange(change: { index: number, row: any, component: MyFormComponent, values: any[] }, component: MyFormComponent) {
    this.config().form.controls[component.key].setValue(change.values);
    this.onFormChange.emit({ component: component, isInit: false, childTable: { row: change.row, component: change.component, index: change.index, isInit: false } });
  }

  onRowChange(component: MyFormComponent) {
    this.onFormChange.emit({ component: component, isInit: false });
  }

  onCloseDialog() {
    this.dialogRef?.close()
  }

  onRemoveTableRow() {
    this.dialogRef?.close({ isRemove: true })
    this.removeTableRow.emit(undefined);
  }

  async onOpenTableForm(event: any, component: MyFormComponent) {
    const options = {
      title: event.title,
      document: event.document,
      component: component,
      callback: event.callback
    }
    this.openTableForm.emit(options)
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
    return this.config().form.get(key) as FormArray;
  }

  getSections(tab: MyFromGroup) {
    return this.config().sections.filter(s => s.parent == tab.key)
  }
  getComponents(section: MyFromGroup) {
    return this.config().components.filter(c => c.group == section.key)
  }

  // Method to selectively update specific components without full re-render
  updateComponentTypes() {
    // Only trigger change detection without forcing a complete re-render
    // This preserves dynamic type changes while preventing scroll resets
    this.cd.markForCheck();
  }

}

export interface MyFormGeneratorConfig {
  form: FormGroup;
  tabs: MyFromGroup[];
  sections: MyFromGroup[];
  components: MyFormComponent[];
  generator?: MyFormGenerator;
  initValue?: { [key: string]: any };
  showValidation?: boolean;
  readOnly?: boolean;
}

export interface FormKeyboardEvent {
  component: MyFormComponent,
  event: KeyboardEvent;
}

export interface MyFromGroup {
  key: string;
  label?: string;
  parent?: string;
  sectionExpanded?: boolean;
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
  group?: string;
  col?: string;
  type: MyFormComponentType;
  color?: "primary" | "secondary" | "light" | "dark" | "success" | "warning" | "danger" | "tertiary" | "medium";
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  value?: any;
  options?: { label: string, value: any, checked?: boolean }[];
  sortOrder?: number;
  dateTimeConfig?: {
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
    readOnly?: boolean
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
  | "datetime-local" | "hidden" | "checkbox" | 'textarea' | 'currency'
  | "checkboxGroup" | "datePicker" | "image" | "table" | "link" | "dropdown" | "breakline"
