import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { MyFormChildTableColumn, MyFormComponent, MyFormComponentType, MyFormGenerator, MyFormGeneratorConfig, MyFormTab } from '@myerp/components';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BaseService } from '../../services/base.service';
import { FormGroup } from '@angular/forms';
import { toReadableDateString } from '@myerp/utils/misc';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { ChangeScriptResponse, MyERPDocType, MyERPField, MyErpFieldType } from '@myerp/interfaces/interface';
import { environment } from '../../../environments/environment';
import { MyMessageBoxResponse } from '@myerp/services';
import { myErpFields } from '@myerp/interfaces/const';
import { MyTranslatePipe } from '@myerp/pipes';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { PrintComponent } from '../print/print.component';

@Component({
  selector: 'app-document',
  imports: [ShareModule, MyFormGenerator, MatDialogModule, NgbDropdownModule],
  providers: [MyTranslatePipe],
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss'
})
export class DocumentComponent {
  public title: string = '';
  public documentTypeId: string = '';
  public documentId: string = '';
  public formConfig!: MyFormGeneratorConfig;
  public document?: any;
  public isNew: boolean = true;
  public showTitle: boolean = true;
  public isViewOnly: boolean = false;
  public dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  public dialogRef = inject(MatDialogRef<MyFormGenerator>, { optional: true });
  public documentType!: MyERPDocType;
  public destroy$: Subject<boolean> = new Subject<boolean>();
  public isChanged: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private baseService: BaseService,
    private cd: ChangeDetectorRef,
    private myTranslate: MyTranslatePipe,
    private dialog: MatDialog,) {

  }

  async ngOnInit() {
    switch (this.dialogData?.dialog) {
      case 'newForm':
        this.documentType = this.dialogData.docType;
        this.formConfig = this.populateFormConfig(this.documentType);
        this.title = this.dialogData.title;
        this.documentTypeId = this.dialogData.docType.id;
        break;
      case 'viewDocs':
        this.isViewOnly = this.dialogData.viewOnly;
        this.documentId = this.dialogData.documentId;
        this.document = this.dialogData.document;
        this.isNew = false;
        this.documentType = this.dialogData.docType;
        this.formConfig = this.populateFormConfig(this.documentType);
        this.title = this.dialogData.title;
        this.documentTypeId = this.dialogData.docType.id;
        break;
      case "tableForm":
        this.showTitle = false;
        this.documentId = this.dialogData.documentId;
        this.document = this.dialogData.document;
        this.isNew = false;
        this.documentType = this.dialogData.docType;
        this.formConfig = this.populateFormConfig(this.documentType);
        this.title = this.dialogData.title;
        this.documentTypeId = this.dialogData.docType.id;
        this.dialogRef?.beforeClosed().pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.onCloseTableFormDialog()
        });
        break
      default:
        this.baseService.subscribeParam(this.route, async (p: any) => {
          this.documentTypeId = p['documentType'];
          this.documentId = p['id'];
          if (this.documentId) {
            this.isNew = false;
            this.document = await this.getDocumentById(this.documentTypeId, this.documentId);
            this.isViewOnly = this.document.docStatus == 'SUBMIT' || this.document.docStatus == 'CANCELLED';
          }
          await this.getDocumentType();

        })
    }


  }

  async getDocumentType() {
    this.documentType = await this.api.getDocumentType(this.documentTypeId);
    this.title = this.documentType.label;
    this.formConfig = this.populateFormConfig(this.documentType);
  }

  populateFormConfig(documentType: MyERPDocType) {

    if (this.isViewOnly) {
      documentType.fields = documentType.fields.map(f => {
        return { ...f, isReadOnly: true }
      });
      const tableFields = this.documentType.fields.filter((f: MyERPField) => f.type == "table");
      for (const tb of tableFields) {
        tb.fieldsDocType!.fields = tb.fieldsDocType!.fields.map(tf => {
          return { ...tf, isReadOnly: true }
        })
      }
    }
    let form!: FormGroup;
    const tabsFields: MyERPField[] = this.baseService.sortDocumentFields(documentType.fields.filter(f => f.type == "tab"));
    const tabs: MyFormTab[] = []

    for (const t of tabsFields) {
      const sections: any = this.getSection(documentType.fields, t.tabId);
      if (sections.length > 0) {
        tabs.push({ key: t.id, label: t.label, sections: sections })
      }
    }
    const sections: any = this.getSection(documentType.fields);
    if (sections) {
      tabs.unshift({ key: '', label: '', sections: sections })
    }
    return {
      tabs: tabs,
      form: form,
      initValue: this.populateDocument(documentType)
    }
  }

  populateDocument(documentType: MyERPDocType) {
    if (!this.document) {
      return;
    }
    for (const f of documentType.fields) {
      if (f.isReadOnly && (f.type == 'date' || f.type == "time" || f.type == "datetime")) {
        this.document[f.id] = toReadableDateString(this.document[f.id], f.type)
      }
    }
    return this.document;
  }

  async getDocumentById(documentTypeId: string, documentId: string) {
    return await this.api.getDocumentByField(documentTypeId, "id", documentId);
  }

  getSection(fields: MyERPField[], tabId?: string) {
    const sectionFields: MyERPField[] = this.baseService.sortDocumentFields(fields.filter(f => f.type == "section" && f.tabId == tabId));
    const sections = [];
    for (let s of sectionFields) {
      const components = this.populateFieldsToFormComponents(this.baseService.sortDocumentFields(fields.filter(f => f.sectionId == s.id)));

      if (components.length > 0) {
        sections.push({ key: s.id, label: s.label, sectionExpanded: s.sectionExpanded, components: components });
      }
    }
    const components = this.populateFieldsToFormComponents(this.baseService.sortDocumentFields(fields.filter(f => !f.sectionId && f.type != 'tab' && f.type != 'section' && !f.isHidden)));
    if (components.length > 0) {
      sections.unshift({ key: '', label: '', components: components });
    }
    return sections;
  }

  populateFieldsToFormComponents(fields: MyERPField[]) {
    return fields.map(f => {
      return this.populateFieldsToFormComponent(f);
    })
  }

  populateFieldsToFormComponent(f: MyERPField) {
    const component: MyFormComponent = {
      key: f.id,
      label: f.label,
      col: f.formColumnSize || 'col-12 col-sm-6 col-md-4 col-lg-4',
      required: f.mandatory,
      value: f.defaultValue,
      sortOrder: f.sorting,
      type: this.populateFormType(f),
      options: f.options
    }

    if (f.type == 'link' && (f.canAddNew || f.canView || f.canEdit)) {
      component['selectConfig'] = {
        canAddNew: f.canAddNew,
        canView: f.canView,
        canEdit: f.canEdit,
        formConfig: this.populateFormConfig(f.fieldsDocType!)
      }
    }
    if (f.type == 'table') {
      component['tableConfig'] = {
        columns: this.populateChildTableColumn(f.fieldsDocType?.fields!),
        displayColumns: this.populateChildTableColumn((f.fieldsDocType?.fields || []).filter(f => !f.isHidden && f.showInTable && this.validTypeForTable(f.type))),
        formConfig: this.populateFormConfig(f.fieldsDocType!)
      }
    }
    return component;
  }

  validTypeForTable(type: MyErpFieldType) {
    switch (type) {
      case "section":
      case "tab":
      case "table":
      case "breakline":
        return false;
      default:
        return true;
    }
  }

  populateChildTableColumn(fields: MyERPField[]) {
    fields = fields.filter(f => this.isValueField(f.type))
    return fields.map(f => {
      const column: MyFormChildTableColumn = {
        key: f.id,
        label: f.label || '',
        component: this.populateFieldsToFormComponent(f),
        required: f.mandatory,
        defaultValue: f.defaultValue,
      }
      return column;
    })
  }

  populateFormType(field: MyERPField): MyFormComponentType {
    if (field.isHidden || !field.showInForm) {
      return "hidden";
    }
    if (field.isReadOnly || (field.isNotEditable && !this.isNew)) {
      switch (field.type) {
        case 'currency':
          return "readOnlyCurrency";
        case 'table':
          return 'table';
        default:
          return "readOnly";
      }

    }
    return field.formComponentType || this.convertFieldTypeToFormComponentType(field.type);
  }

  convertFieldTypeToFormComponentType(type: MyErpFieldType): MyFormComponentType {
    switch (type) {
      case "boolean":
        return "checkbox";
      case "currency":
        return "currency";
      case "number":
        return "number";
      case "date":
        return "datePicker";
      case "time":
        return "time";
      case "datetime":
        return "datetime-local";
      case "link":
        return "select"
      case "table":
        return "table";
      case "breakline":
        return "breakline";
      default:
        return "text";
    }
  }



  isValueField(type: MyErpFieldType) {
    switch (type) {
      case 'tab':
      case "breakline":
      case 'section':
        return false;
      default:
        return true;
    }
  }


  async onChange(event: { component: MyFormComponent, isInit: boolean, childTable?: { component: MyFormComponent, row: any, index: number, isInit?: boolean } }) {
    if (event.component.type == 'select' && event.component.value == '_ADDNEW') {
      await this.addNewLinkDocument(event.component);
      return;
    }
    const field = this.documentType.fields.find(f => f.id == event.component.key);
    if (field?.type == "table") {
      const childField = field.fieldsDocType?.fields.find(f => f.id == event.childTable?.component.key!);
      const componentKey = event.childTable!.component.key;
      if (childField?.callServerScript) {
        const response = await this.runServerChangeScript(
          field.fieldsDocType?.id!,
          { [componentKey]: event.component.value[event.childTable!.index][componentKey] },
          event.component.value[event.childTable!.index],
          this.formConfig.form.value,
          event.childTable?.isInit,
          event.childTable!.index
        )
        this.updateChildTableFormAfterScript(response, event.component, event.childTable);
      }
      if (childField?.callClientScript) {

        const response: any = await this.runClientChangeScript(
          field.fieldsDocType?.id!,
          { [componentKey]: event.component.value[event.childTable!.index][componentKey] },
          event.component.value[event.childTable!.index],
          this.formConfig.form.value,
          event.childTable?.isInit,
          event.childTable!.index
        )

        this.updateChildTableFormAfterScript(response, event.component, event.childTable);
      }

    }

    if (field?.callServerScript) {
      const response = await this.runServerChangeScript(
        this.documentTypeId,
        { [event.component.key]: event.component.value },
        this.formConfig.form.value,
        null,
        event.isInit,
        event.childTable?.index
      )
      this.updateFormAfterScript(response);
    }
    if (field?.callClientScript) {

      const response: any = await this.runClientChangeScript(
        this.documentTypeId,
        { [event.component.key]: event.component.value },
        this.formConfig.form.value,
        null,
        event.isInit,
        event.childTable?.index
      )

      this.updateFormAfterScript(response);
    }

    this.isChanged = true;
  }



  async runServerChangeScript(documentId: string, change: any, formValue: any, parentFormValue?: any, isInit?: boolean, index?: number) {
    const body = {
      action: 'onChange',
      parentFormValue: parentFormValue,
      formValue: formValue,
      change: change,
      isInit: isInit,
      index: index
    }
    const response: any = await this.api.runEventScript(documentId, body);
    return response;
  }

  async runClientChangeScript(documentId: string, change: any, formValue: any, parentFormValue?: any, isInit?: boolean, index?: number) {
    const module = await import(/* @vite-ignore */`/assets/client-script/events/${documentId}-event.js`);
    const data = {
      action: 'onChange',
      parentFormValue: parentFormValue,
      formValue: formValue,
      change: change,
      isInit: isInit,
      index: index
    }
    const response = await module.onChange(data);
    return response;
  }

  updateChildTableFormAfterScript(response: ChangeScriptResponse, component: MyFormComponent, childTable?: { component: MyFormComponent, row: any, index: number, isInit?: boolean }) {
    if (response.formValue) {
      component.value[childTable!.index] = { ...component.value[childTable!.index], ...response.formValue }
      this.cd.detectChanges();
    }

    if (response.parentFormValue) {
      this.formConfig.form.patchValue(response.parentFormValue);
      setTimeout(() => {
        this.formConfig.form.patchValue(response.parentFormValue);
      }, 0);
    }
    if (response.componentOptions) {
      for (const key of Object.keys(response.componentOptions)) {
        const col = childTable!.row.cols.find((c: any) => c.component.key == key)
        if (col.component) {
          col.component.options = [];
          setTimeout(() => {
            col.component.options = [...response.componentOptions[key]]
          }, 200);
        }
      }
    }
    if (response.formConfig) {
      for (const key of Object.keys(response.formConfig)) {
        const col = childTable!.row.cols.find((c: any) => c.component.key == key)
        col.component[key] = response.componentOptions[key];
      }
    }

  }

  updateFormAfterScript(response: ChangeScriptResponse) {
    if (response.formValue) {
      //Temporary Solution: For force update DOM
      this.formConfig.form.patchValue(response.formValue);
      setTimeout(() => {
        this.formConfig.form.patchValue(response.formValue);
      }, 0);


    }
    if (response.componentOptions) {
      for (const key of Object.keys(response.componentOptions)) {
        const c = this.findFormComponent(this.formConfig, key)!;
        c.options = [];
        setTimeout(() => {
          c.options = [...response.componentOptions[key]]
        }, 0);
      }
    }
    if (response.formConfig) {
      for (const key of Object.keys(response.formConfig)) {
        const c: any = this.findFormComponent(this.formConfig, key)!;
        c[key] = response.componentOptions[key];
      }
    }
  }

  async onOpenTableForm(event: any) {

    const field = this.documentType.fields.find(f => f.id == event.component.key);
    const fieldDocType = field?.fieldsDocType!;
    const dialogRef = this.dialog.open(DocumentComponent, {
      data: { dialog: "tableForm", docType: fieldDocType, title: event.title, documentId: event.document?.id, document: event.document },
      maxWidth: "90vw",
      minWidth: "90vw",
      maxHeight: "90vh",
    });
    const res = await firstValueFrom(dialogRef.afterClosed());
    event.callback(res);
  }

  async addNewLinkDocument(component: MyFormComponent) {
    const field = this.documentType.fields.find(f => f.id == component.key);
    const fieldDocType = field?.fieldsDocType;
    const title = component.label;
    const dialogRef = this.dialog.open(DocumentComponent, {
      data: { dialog: "newForm", docType: fieldDocType, title: title },
      maxWidth: "90vw",
      minWidth: "90vw",
      maxHeight: "90vh",
    });
    const res = await firstValueFrom(dialogRef.afterClosed());
    if (!res) {
      this.formConfig.form.controls[field!.id].setValue(null);
      return;
    }
    const parentValueField = field?.linkOptions?.valueField!;
    const parentLabelField = field?.linkOptions?.labelField!;
    for (const t of this.formConfig.tabs) {
      let isBreak = false;
      for (const s of t.sections) {
        const com = s.components.find(c => c.key == component.key);
        if (com) {
          com.options?.push({ label: res[parentLabelField], value: res[parentValueField] });
          isBreak = true;
          break;
        }
      }
      if (isBreak) {
        break;
      }
    }
    this.formConfig.form.controls[field!.id].setValue(res[parentValueField]);
  }

  async viewLinkDocument(event: { component: MyFormComponent, canEdit: boolean }) {
    const field = this.documentType.fields.find(f => f.id == event.component.key);
    const fieldDocType = field?.fieldsDocType!;
    const doc = await this.getDocumentById(fieldDocType.id, event.component.value);
    const title = event.component.label;
    const dialogRef = this.dialog.open(DocumentComponent, {
      data: { dialog: "viewDocs", docType: fieldDocType, title: title, documentId: event.component.value, document: doc, viewOnly: !event.canEdit },
      maxWidth: "90vw",
      minWidth: "90vw",
      maxHeight: "90vh",
    });
    const res = await firstValueFrom(dialogRef.afterClosed());
    // const parentValueField = field?.linkOptions?.valueField!;
    // const parentLabelField = field?.linkOptions?.labelField!;
    // for (const t of this.formConfig.tabs) {
    //   let isBreak = false;
    //   for (const s of t.sections) {
    //     const com = s.components.find(c => c.key == component.key);
    //     if (com) {
    //       com.options?.push({ label: res[parentLabelField], value: res[parentValueField] });
    //       isBreak = true;
    //       break;
    //     }
    //   }
    //   if (isBreak) {
    //     break;
    //   }
    // }
    // this.formConfig.form.controls[field!.id].setValue(res[parentValueField]);
  }

  onCloseDialog(data?: any) {
    this.dialogRef?.close(data);
  }

  onCloseTableFormDialog(isRemove: boolean = false) {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.dialogRef?.close({ isRemove: isRemove, value: this.formConfig.form.value });
  }

  findFormComponent(formConfig: MyFormGeneratorConfig, key: string) {
    for (const t of formConfig.tabs) {
      for (const s of t.sections) {
        const com = s.components.find(c => c.key == key);
        if (com) {
          return com;
        }
      }
    }
    return;
  }

  async onSave() {
    if (!this.formConfig.generator?.validateForm()) {
      const invalidControls = this.formConfig.generator?.getErrorFormControlKeys();
      const controlsNames = [];
      for (const key of Object.keys(invalidControls)) {
        const docField = this.documentType.fields.find(f => f.id == key)!;
        const name = this.myTranslate.transform(docField.label || '');
        controlsNames.push(name);
      }
      const trans = await this.baseService.getTranslate('_INVALID_FIELDS');
      const message = `${trans}\n- ${controlsNames.join('\n- ')}`;
      await this.baseService.showWarningMessage(message);
      return;
    }
    let response: any;
    try {
      if (this.isNew) {
        response = await this.api.createDocument(this.documentTypeId, this.formConfig.form.value);
      } else {
        response = await this.api.updateDocumentByField(this.documentTypeId, "id", this.documentId, this.formConfig.form.value);
      }
      if (this.dialogData?.dialog == "newForm") {
        this.onCloseDialog(response);
      } else {
        await this.baseService.showSuccessToast("_HAS_SAVED");
        this.isChanged = false;
        if (this.isNew) {
          this.baseService.navigateTo(`/doc/${this.documentTypeId}/${response!['id']}`)
        }
      }


    } catch (error: any) {
      await this.baseService.showErrorMessage(error);
    }


  }

  async onSubmit() {
    const confirm = await this.baseService.showConfirm("_CONFIRM_SUBMIT");
    if (confirm == MyMessageBoxResponse.confirm) {
      await this.api.updateDocumentByField(this.documentTypeId, "id", this.documentId, { docStatus: 'SUBMIT' });
      await this.baseService.showSuccessToast("_HAS_SAVED");
      // this.document.docStatus = 'SUBMIT';
      await this.baseService.refreshRoute();
    }
  }

  async onCancel() {
    const confirmKey = "CANCEL";
    const msg = await this.baseService.getTranslate("_CONFIRM_CANCEL", { confirmKey: confirmKey });
    const confirm = await this.baseService.showInputConfirm(msg, confirmKey)
    if (confirm == MyMessageBoxResponse.confirm) {
      await this.api.updateDocumentByField(this.documentTypeId, "id", this.documentId, { docStatus: 'CANCELLED' });
      await this.baseService.showSuccessToast("_HAS_CANCELLED");
      // this.document.docStatus = 'SUBMIT';
      await this.baseService.refreshRoute();
    }
  }

  async onDelete() {
    const confirmKey = "DELETE";
    const msg = await this.baseService.getTranslate("_CONFIRM_DELETE", { confirmKey: confirmKey });
    const confirm = await this.baseService.showInputConfirm(msg, confirmKey)
    if (confirm == MyMessageBoxResponse.confirm) {
      await this.api.updateDocumentByField(this.documentTypeId, "id", this.documentId, { isDeleted: true });
      await this.baseService.showSuccessToast("_HAS_DELETED");
      // this.document.docStatus = 'SUBMIT';
      await this.baseService.navigateTo(`/doc/${this.documentTypeId}`, { replaceUrl: true })
    }
  }

  async onPrint() {

    // let response: any;
    const data = {
      action: 'onPrint',
      formValue: this.formConfig.form.value,
      documentId: this.documentId,
      documentType: this.documentType
    }
    
    const dialogRef = this.dialog.open(PrintComponent, {
      data:  data ,
      maxWidth: "90vw",
      minWidth: "90vw",
      minHeight: "90vh",
      maxHeight: "90vh",
    });

  }

  async onAction(action: string) {

  }
}


