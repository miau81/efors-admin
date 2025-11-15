import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { MyFormChildTableColumn, MyFormComponent, MyFormComponentType, MyFormGenerator, MyFormGeneratorConfig, MyFormTab, MyFromGroup } from '@myerp/components';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BaseService } from '../../services/base.service';
import { FormGroup } from '@angular/forms';
import { toReadableDateString } from '@myerp/utils/misc';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { ChangeScriptResponse, MyERPDocType, MyERPField, MyERPFieldGroup, MyErpFieldType } from '@myerp/interfaces/interface';
import { environment } from '../../../environments/environment';
import { MyMessageBoxResponse } from '@myerp/services';
import { myErpFields } from '@myerp/interfaces/const';
import { MyTranslatePipe } from '@myerp/pipes';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { PrintComponent } from '../print/print.component';
import { read } from 'fs';
import { MyBackButton } from '../../@core/components/back-button/back-button.component';

@Component({
  selector: 'app-document',
  imports: [ShareModule, MyFormGenerator, MatDialogModule, NgbDropdownModule,MyBackButton],
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
    private dialog: MatDialog
  ) {

  }

  async ngOnInit() {
    switch (this.dialogData?.dialog) {
      case 'newForm':
        this.documentType = this.dialogData.docType;
        this.formConfig = this.populateFormConfig(this.documentType);
        this.formConfig.initValue = this.populateDocument(this.documentType);
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
        this.formConfig.initValue = this.populateDocument(this.documentType);
        this.title = this.dialogData.title;
        this.documentTypeId = this.dialogData.docType.id;
        break;
      case "tableForm":
        this.isViewOnly = this.dialogData.viewOnly;
        this.showTitle = false;
        this.documentId = this.dialogData.documentId;
        this.document = this.dialogData.document;
        this.isNew = false;
        this.documentType = this.dialogData.docType;
        this.formConfig = this.populateFormConfig(this.documentType);
        this.formConfig.initValue = this.populateDocument(this.documentType);
        this.title = this.dialogData.title;
        this.documentTypeId = this.dialogData.docType.id;
        this.dialogRef?.beforeClosed().pipe(takeUntil(this.destroy$)).subscribe((res) => {
          this.onCloseTableFormDialog(res)
        });
        break
      default:
        this.baseService.subscribeParam(this.route, async (p: any) => {
          this.documentTypeId = p['documentType'];
          this.documentId = p['id'];
          try {
            await this.baseService.showLoading();
            if (this.documentId) {
              this.isNew = false;
              this.document = await this.getDocumentById(this.documentTypeId, this.documentId);
              this.isViewOnly = this.document.docStatus == 'SUBMIT' || this.document.docStatus == 'CANCELLED';
            }
            await this.getDocumentType();
            this.formConfig.initValue = this.populateDocument(this.documentType);
          } catch (error: any) {
            await this.baseService.showErrorMessage(error);
          } finally {
            await this.baseService.dismissLoading();
          }
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
    // const tabsFields: MyERPField[] = this.baseService.sortDocumentFields(documentType.fields.filter(f => f.type == "tab"));
    const tabGroups: MyERPFieldGroup[] = this.baseService.sortDocumentFieldGroups(documentType.tabs || []);
    const formTabs: MyFromGroup[] = [];


    for (const t of tabGroups) {
      formTabs.push({ key: t.id, label: t.label })
    }

    const sections: MyERPFieldGroup[] = this.baseService.sortDocumentFieldGroups(documentType.sections || []);
    const formSections: MyFromGroup[] = [];
    for (const s of sections) {
      formSections.push({ key: s.id, label: s.label, parent: s.parent, sectionExpanded: s.sectionExpanded });
    }

    const components: MyFormComponent[] = this.populateFieldsToFormComponents(documentType.fields);

    return {
      tabs: formTabs,
      sections: formSections,
      components: components,
      form: form,
      readOnly: this.isViewOnly
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
    const params = { getChild: true, getParent: true }
    return await this.api.getDocumentByField(documentTypeId, "id", documentId, params);
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
      group: f.sectionId,
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
        formConfig: this.populateFormConfig(f.fieldsDocType!),
        readOnly: this.isViewOnly
      }
    }
    if (f.type == 'currency') {
      console.log("currency")
      component['value'] = component['value']?.toFixed(2);
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
        case 'breakline':
          return 'breakline';
        case 'textarea':
          return 'readOnlyTextArea';
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
        return "date";
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
      case "textarea":
        return "textarea";
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
    try {
      await this.baseService.showLoading();
      const response: any = await this.api.runEventScript(documentId, body);
      return response;
    } catch (error: any) {
      await this.baseService.showErrorMessage(error);
    } finally {
      await this.baseService.dismissLoading();
    }
  }

  async runClientChangeScript(documentId: string, change: any, formValue: any, parentFormValue?: any, isInit?: boolean, index?: number) {
    const module = await import(/* @vite-ignore */`/assets/client-script/events/${documentId}.event.js`);
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
        let c: any = this.findFormComponent(this.formConfig, key)!;
        Object.assign(c, response.formConfig[key]);
      }
    }
  }

  async onOpenTableForm(event: any) {

    const field = this.documentType.fields.find(f => f.id == event.component.key);
    const fieldDocType = field?.fieldsDocType!;
    const dialogRef = this.dialog.open(DocumentComponent, {
      data: { dialog: "tableForm", docType: fieldDocType, title: event.title, documentId: event.document?.id, document: event.document, viewOnly: this.isViewOnly },
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
      data: { dialog: "newForm", docType: fieldDocType, title: title, viewOnly: false },
      maxWidth: "90vw",
      minWidth: "90vw",
      minHeight: "90vh",
      maxHeight: "90vh",

    });
    const res = await firstValueFrom(dialogRef.afterClosed());
    if (!res) {
      this.formConfig.form.controls[field!.id].setValue(null);
      return;
    }
    const parentValueField = field?.linkOptions?.valueField!;
    const parentLabelField = field?.linkOptions?.labelField!;
    const com = this.formConfig.components.find(c => c.key == component.key);
    if (com) {
      com.options?.push({ label: res[parentLabelField], value: res[parentValueField] });
    }
    this.formConfig.form.controls[field!.id].setValue(res[parentValueField]);
  }

  onClose() {
    this.dialogRef?.close();
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
    return formConfig.components.find(c => c.key == key);
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
      await this.baseService.showLoading();
      if (this.isNew) {
        response = await this.api.createDocument(this.documentTypeId, this.formConfig.form.value);
      } else {
        response = await this.api.updateDocumentByField(this.documentTypeId, "id", this.documentId, this.formConfig.form.value);
      }
      if (this.dialogData?.dialog == "newForm") {
        this.onCloseDialog(response);
      } else {
        await this.baseService.dismissLoading();
        await this.baseService.showSuccessToast("_HAS_SAVED");
        this.isChanged = false;
        if (this.isNew) {
          this.baseService.navigateTo(`/doc/${this.documentTypeId}/${response!['id']}`)
        }
      }
    } catch (error: any) {
      await this.baseService.showErrorMessage(error);
    } finally {
      await this.baseService.dismissLoading();
    }


  }

  async onSubmit() {
    const confirm = await this.baseService.showConfirm("_CONFIRM_SUBMIT");
    if (confirm == MyMessageBoxResponse.confirm) {
      try {
        await this.baseService.showLoading();
        await this.api.updateDocumentByField(this.documentTypeId, "id", this.documentId, { docStatus: 'SUBMIT' });
        await this.baseService.dismissLoading();
        await this.baseService.showSuccessToast("_HAS_SUBMITED");
        // this.document.docStatus = 'SUBMIT';
        await this.baseService.refreshRoute();
      } catch (error: any) {
        await this.baseService.showErrorMessage(error);
      } finally {
        await this.baseService.dismissLoading();
      }
    }
  }

  async onCancel() {
    const confirmKey = "CANCEL";
    const msg = await this.baseService.getTranslate("_CONFIRM_CANCEL", { confirmKey: confirmKey });
    const confirm = await this.baseService.showInputConfirm(msg, confirmKey)
    if (confirm == MyMessageBoxResponse.confirm) {
      try {
        await this.baseService.showLoading();
        await this.api.updateDocumentByField(this.documentTypeId, "id", this.documentId, { docStatus: 'CANCELLED' });
        await this.baseService.dismissLoading();
        await this.baseService.showSuccessToast("_HAS_CANCELLED");
        await this.baseService.refreshRoute();
      } catch (error: any) {
        await this.baseService.showErrorMessage(error);
      } finally {
        await this.baseService.dismissLoading();
      }
    }
  }

  async onDelete() {
    const confirmKey = "DELETE";
    const msg = await this.baseService.getTranslate("_CONFIRM_DELETE", { confirmKey: confirmKey });
    const confirm = await this.baseService.showInputConfirm(msg, confirmKey)
    if (confirm == MyMessageBoxResponse.confirm) {
      try {
        await this.baseService.showLoading();
        await this.api.updateDocumentByField(this.documentTypeId, "id", this.documentId, { isDeleted: true });
        await this.baseService.dismissLoading();
        await this.baseService.showSuccessToast("_HAS_DELETED");
        // this.document.docStatus = 'SUBMIT';
        await this.baseService.navigateTo(`/doc/${this.documentTypeId}`, { replaceUrl: true });
      } catch (error: any) {
        await this.baseService.showErrorMessage(error);
      } finally {
        await this.baseService.dismissLoading();
      }
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
      data: data,
      maxWidth: "95vw",
      minWidth: "95vw",
      minHeight: "95vh",
      maxHeight: "95vh",
    });

  }

  async onAction(action: string) {

  }
}


