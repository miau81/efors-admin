import { ChangeDetectorRef, Component, DestroyRef, inject, Injector, Type, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { MyFormChildTableColumn, MyFormComponent, MyFormComponentType, MyFormGenerator, MyFormGeneratorConfig, MyFormTab, MyFromGroup } from '@myerp/components';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BaseService } from '../../services/base.service';
import { toReadableDateString } from '@myerp/utils/misc';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChangeScriptResponse, MyERPDocType, MyERPField, MyERPFieldGroup, MyErpFieldType } from '../../@interfaces/interface';
import { MyTranslatePipe } from '@myerp/pipes';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import { PrintComponent } from '../print/print.component';
import { MyBackButton } from '../../@core/components/back-button/back-button.component';
import { FormGroup } from '@angular/forms';
import { DocTypeEvent } from '../../doctype-event/core/doctype.event';
import { DocTypeRegistry } from '../../doctype-event/core/doctype.registry';

@Component({
  selector: 'app-document',
  imports: [ShareModule, MyFormGenerator, MatDialogModule, NgbDropdownModule, MyBackButton],
  providers: [MyTranslatePipe],
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss'
})
export class DocumentComponent {
  // Using signals for reactive state
  readonly title = signal('');
  readonly documentTypeId = signal('');
  readonly documentId = signal('');
  readonly document = signal<any>(undefined);
  readonly isNew = signal(true);
  readonly showTitle = signal(true);
  readonly isViewOnly = signal(false);
  readonly isChanged = signal(false);
  readonly actionButtons = signal<any[]>([]);
  readonly formConfig = signal<MyFormGeneratorConfig | undefined>(undefined);
  readonly documentType = signal<MyERPDocType | undefined>(undefined);

  // Using inject()
  readonly dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  readonly dialogRef = inject(MatDialogRef<MyFormGenerator>, { optional: true });
  private readonly route = inject(ActivatedRoute);
  readonly api = inject(ApiService);
  readonly baseService = inject(BaseService);
  private readonly cd = inject(ChangeDetectorRef);
  private readonly myTranslate = inject(MyTranslatePipe);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  private docTypeInstance?: DocTypeEvent;

  constructor() {
    // Removed the effect that was causing unnecessary change detection
    // The effect was triggering markForCheck on every isChanged signal update
    // which was happening on every input change in the editable-table
  }

  async ngOnInit() {
    const dialogData = this.dialogData;
    if (dialogData?.dialog) {
      switch (dialogData?.dialog) {
        case 'newForm':
          this.documentType.set(dialogData.docType);
          this.formConfig.set(this.populateFormConfig(this.documentType()!));
          this.formConfig()!.initValue = this.populateDocument(this.documentType()!);
          this.title.set(dialogData.title);
          this.documentTypeId.set(dialogData.docType.id);
          break;
        case 'viewDocs':
          this.isViewOnly.set(dialogData.viewOnly);
          this.documentId.set(dialogData.documentId);
          this.document.set(dialogData.document);
          this.isNew.set(false);
          this.documentType.set(dialogData.docType);
          this.formConfig.set(this.populateFormConfig(this.documentType()!));
          this.formConfig()!.initValue = this.populateDocument(this.documentType()!);
          this.title.set(dialogData.title);
          this.documentTypeId.set(dialogData.docType.id);
          break;
        case "tableForm":
          this.isViewOnly.set(dialogData.viewOnly);
          this.showTitle.set(false);
          this.documentId.set(dialogData.documentId);
          this.document.set(dialogData.document);
          this.isNew.set(false);
          this.documentType.set(dialogData.docType);
          this.formConfig.set(this.populateFormConfig(this.documentType()!));
          this.formConfig()!.initValue = this.populateDocument(this.documentType()!);
          this.title.set(dialogData.title);
          this.documentTypeId.set(dialogData.docType.id);
          this.dialogRef?.beforeClosed().pipe(take(1), takeUntilDestroyed(this.destroyRef)).subscribe((res) => {
            this.onCloseTableFormDialog(res)
          });
          break
      }
      this.docTypeInstance = await this.loadDocTypeInstance(this.documentTypeId());
    } else {
      this.baseService.subscribeParam(this.route, async (p: any) => {
        this.documentTypeId.set(p['documentType']);
        this.documentId.set(p['id']);
        try {
          await this.baseService.showLoading();
          if (p['id']) {
            this.isNew.set(false);
            const doc: any = await this.getDocumentById(this.documentTypeId(), this.documentId());
            this.document.set(doc);
            this.isViewOnly.set(doc.docStatus == 'SUBMIT' || doc.docStatus == 'CANCELLED');
          }
          await this.getDocumentType();
          this.formConfig()!.initValue = this.populateDocument(this.documentType()!);
          this.cd.detectChanges();
        } catch (error: any) {
          console.log(error)
          await this.baseService.showErrorMessage(error);
        } finally {
          await this.baseService.dismissLoading();
        }
        this.docTypeInstance = await this.loadDocTypeInstance(this.documentTypeId());
      })
    }

  }

  async loadDocTypeInstance(documentTypeId: string) {
    let docTypeInstance: DocTypeEvent | undefined
    try {
      const DocTypeClass = await DocTypeRegistry.get(documentTypeId);
      docTypeInstance = new DocTypeClass();
    } catch (error) {
      // console.error(error)
    }
    docTypeInstance?.init(this);
    await docTypeInstance?.onLoad?.();

    // Use selective update instead of forceReRender to prevent scroll resets
    const generator = this.formConfig()?.generator;
    if (generator) {
      generator.updateComponentTypes();
    }

    return docTypeInstance;
  }

  async getDocumentType() {
    const docType: any = await this.api.getDocumentType(this.documentTypeId());
    this.documentType.set(docType);
    console.log('DocumentType loaded:', docType);
    this.title.set(docType.label);
    this.formConfig.set(this.populateFormConfig(docType!));
    // Use markForCheck instead of detectChanges to prevent scroll reset
    this.cd.markForCheck();

    // Set initial value after formConfig is populated
    if (this.document()) {
      this.formConfig()!.initValue = this.populateDocument(docType);
      this.cd.markForCheck();
    }
  }

  populateFormConfig(documentType: MyERPDocType) {
    const isViewOnly = this.isViewOnly();

    if (isViewOnly) {
      documentType.fields = documentType.fields.map(f => {
        return { ...f, isReadOnly: true }
      });
      const tableFields = documentType.fields.filter((f: MyERPField) => f.type == "table");
      for (const tb of tableFields) {
        tb.fieldsDocType!.fields = tb.fieldsDocType!.fields.map(tf => {
          return { ...tf, isReadOnly: true }
        })
      }
    }
    let form!: FormGroup;
    const tabGroups: MyERPFieldGroup[] = this.baseService.sortDocumentFieldGroups(documentType.tabs || []);
    const formTabs: MyFromGroup[] = [];

    for (const t of tabGroups) {
      formTabs.push({ key: t.id, label: t.label });
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
      readOnly: isViewOnly
    }
  }

  populateDocument(documentType: MyERPDocType) {
    const doc = this.document();
    if (!doc) {
      return;
    }
    for (const f of documentType.fields) {
      if (f.isReadOnly && (f.type == 'date' || f.type == "time" || f.type == "datetime")) {
        doc[f.id] = toReadableDateString(doc[f.id], f.type)
      }
    }
    return doc;
  }

  async getDocumentById(documentTypeId: string, documentId: string) {
    const params = { getChild: true, getLink: true }
    return await this.api.getDocument(documentTypeId, documentId, params);
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

    // Set readonly property based on field properties
    if (f.isReadOnly || (f.isNotEditable && !this.isNew())) {
      component.readonly = true;
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
        readOnly: component.readonly || this.isViewOnly()
      }
    }
    if (f.type == 'currency') {
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
    const isNew = this.isNew();

    if (field.isHidden || !field.showInForm) {
      return "hidden";
    }
    if (field.isReadOnly || (field.isNotEditable && !isNew)) {
      switch (field.type) {
        case 'table':
          return 'table';
        case 'breakline':
          return 'breakline';
        default:
          const componentType = this.convertFieldTypeToFormComponentType(field.type);
          return componentType;
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
    const docType = this.documentType();

    if (event.component.type == 'select' && event.component.value == '_ADDNEW') {
      await this.addNewLinkDocument(event.component);
      return;
    }
    const field = docType?.fields.find(f => f.id == event.component.key);
    if (field?.type == "table") {
      const childField = field.fieldsDocType?.fields.find(f => f.id == event.childTable?.component.key!);
      if (childField) {
        if (event.childTable!.component.type == 'select' && event.component.value[event.childTable!.index][event.childTable?.component.key!] == '_ADDNEW') {
          await this.addNewLinkDocumentToChild(childField, event.component, event.childTable?.component!, event.childTable!.index);
          return;
        }

        const componentKey = event.childTable!.component.key;
        const childInstance = await this.loadDocTypeInstance(field.fieldsDocType?.id!);
        await childInstance?.onFormChange?.(componentKey, event.component.value[event.childTable!.index][componentKey], event.childTable!.index)
        //   const response = await childInstance?.onFormChange?.(
        //     { [componentKey]: event.component.value[event.childTable!.index][componentKey] },
        //     event.component.value[event.childTable!.index],
        //     this.formConfig()!.form.value,
        //     event.childTable?.isInit,
        //     event.childTable!.index) || {}
        //   this.updateChildTableFormAfterScript(response || {}, event.component, event.childTable);
      }
    }

    // Only mark as changed if this is not a child table change or if it's an initial change
    if (!event.childTable || event.isInit) {
      this.isChanged.set(true);
    }

    await this.docTypeInstance?.onFormChange?.(event.component.key, event.component.value);


    // const response = await this.docTypeInstance?.onFormChange?.(
    //   { [event.component.key]: event.component.value },
    //   this.formConfig()!.form.value,
    //   null,
    //   event.isInit,
    //   event.childTable?.index
    // ) || {}
    // this.updateFormAfterScript(response);
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

  updateChildTableFormAfterScript(response: ChangeScriptResponse, component: MyFormComponent, childTable?: { component: MyFormComponent, row: any, index: number, isInit?: boolean }) {
    if (response.formValue) {
      component.value[childTable!.index] = { ...component.value[childTable!.index], ...response.formValue }
      // Use markForCheck instead of detectChanges to prevent scroll reset
      this.cd.markForCheck();
    }

    if (response.parentFormValue) {
      this.formConfig()!.form.patchValue(response.parentFormValue);
      setTimeout(() => {
        this.formConfig()!.form.patchValue(response.parentFormValue);
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
      this.formConfig()!.form.patchValue(response.formValue);
      setTimeout(() => {
        this.formConfig()!.form.patchValue(response.formValue);
      }, 0);
    }

    if (response.componentOptions) {
      for (const key of Object.keys(response.componentOptions)) {
        const c = this.findFormComponent(this.formConfig()!, key)!;
        c.options = [];
        setTimeout(() => {
          c.options = [...response.componentOptions[key]]
        }, 0);
      }
    }

    if (response.formConfig) {
      for (const key of Object.keys(response.formConfig)) {
        let c: any = this.findFormComponent(this.formConfig()!, key)!;
        Object.assign(c, response.formConfig[key]);
      }
    }
  }

  async onOpenTableForm(event: any) {
    const field = this.documentType()!.fields.find(f => f.id == event.component.key);
    const fieldDocType = field?.fieldsDocType!;
    const dialogRef = this.dialog.open(DocumentComponent, {
      data: { dialog: "tableForm", docType: fieldDocType, title: event.title, documentId: event.document?.id, document: event.document, viewOnly: this.isViewOnly() },
      maxWidth: "90vw",
      minWidth: "90vw",
      maxHeight: "90vh",
    });
    const res = await firstValueFrom(dialogRef.afterClosed());
    console.log("afterclose", res)
    console.log(res)
    event.callback(res);
  }

  async addNewLinkDocument(component: MyFormComponent) {
    const field = this.documentType()!.fields.find(f => f.id == component.key);
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
      this.formConfig()!.form.controls[field!.id].setValue(null);
      return;
    }
    const parentValueField = field?.linkOptions?.valueField!;
    const parentLabelField = field?.linkOptions?.labelField!;
    const com = this.formConfig()!.components.find(c => c.key == component.key);
    if (com) {
      com.options?.push({ label: res[parentLabelField], value: res[parentValueField] });
    }
    this.formConfig()!.form.controls[field!.id].setValue(res[parentValueField]);
  }

  async addNewLinkDocumentToChild(childField: MyERPField, parentComponent: MyFormComponent, childComponent: MyFormComponent, index: number) {
    const field = childField;
    const fieldDocType = childField?.fieldsDocType;
    const title = childField.label;
    const dialogRef = this.dialog.open(DocumentComponent, {
      data: { dialog: "newForm", docType: fieldDocType, title: title, viewOnly: false },
      maxWidth: "90vw",
      minWidth: "90vw",
      minHeight: "90vh",
      maxHeight: "90vh",
    });
    const res = await firstValueFrom(dialogRef.afterClosed());
    console.log(childComponent)
    // if (!res) {
    //   parentComponent.value[index][childField.id]=null
    this.formConfig()!.form.controls[parentComponent.key].setValue(parentComponent.value);
    //   return;
    // }
    const parentValueField = field?.linkOptions?.valueField!;
    const parentLabelField = field?.linkOptions?.labelField!;
    // const com = this.formConfig()!.components.find(c => c.key == parentComponent.key);
    // // if (com) {

    //   childComponent.options?.push({ label: res?.[parentLabelField] || "AAA", value: res?.[parentValueField] || "AAA" });
    //   this.cd.markForCheck()

    // 
    parentComponent.value[index][childField.id] = "AAA"
    this.formConfig()!.form.controls[parentComponent.key].setValue(parentComponent.value);
  }

  onClose() {
    this.dialogRef?.close();
  }

  async viewLinkDocument(event: { component: MyFormComponent, canEdit: boolean }) {
    const field = this.documentType()!.fields.find(f => f.id == event.component.key);
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
  }

  onCloseDialog(data?: any) {
    this.dialogRef?.close(data);
  }

  onCloseTableFormDialog(isRemove: boolean = false) {
    this.dialogRef?.close({ isRemove: isRemove, value: this.formConfig()!.form.value });
  }

  findFormComponent(formConfig: MyFormGeneratorConfig, key: string) {
    return formConfig.components.find(c => c.key == key);
  }

  async onSave() {
    if (!this.formConfig()!.generator?.validateForm()) {
      const invalidControls = this.formConfig()!.generator?.getErrorFormControlKeys();
      const controlsNames = [];
      for (const key of Object.keys(invalidControls!)) {
        const docField = this.documentType()!.fields.find(f => f.id == key)!;
        const name = this.myTranslate.transform(docField.label || '');
        controlsNames.push(name);
      }
      const trans = await this.baseService.getTranslate('_INVALID_FIELDS');
      const message = `${trans}\n- ${controlsNames.join('\n- ')}`;
      await this.baseService.showWarningMessage(message);
      return;
    }

    if ((await this.docTypeInstance?.onBeforeSave?.())?.skip || false) {
      return;
    }

    let response: any;
    try {
      await this.baseService.showLoading();
      if (this.isNew()) {
        response = await this.api.createDocument(this.documentTypeId(), this.formConfig()!.form.value);
      } else {
        response = await this.api.updateDocument(this.documentTypeId(), this.documentId(), this.formConfig()!.form.value);
      }

      await this.docTypeInstance?.onAfterSave?.()

      if (this.dialogData?.dialog == "newForm") {
        this.onCloseDialog(response);
      } else {
        await this.baseService.dismissLoading();
        await this.baseService.showSuccessToast("_HAS_SAVED");
        this.isChanged.set(false);
        if (this.isNew()) {
          this.baseService.navigateTo(`/doc/${this.documentTypeId()}/${response!['id']}`)
        }
      }
    } catch (error: any) {
      await this.baseService.showErrorMessage(error);
    } finally {
      await this.baseService.dismissLoading();
    }
  }

  async onSubmit() {
    if ((await this.docTypeInstance?.onBeforeSubmit?.())?.skip || false) {
      return;
    }

    const confirm = await this.baseService.showConfirm("_CONFIRM_SUBMIT");
    if (confirm == 'yes') {
      try {
        await this.baseService.showLoading();
        await this.api.updateDocument(this.documentTypeId(), this.documentId(), { docStatus: 'SUBMIT' });
        await this.docTypeInstance?.onAfterSubmit?.();
        await this.baseService.dismissLoading();
        await this.baseService.showSuccessToast("_HAS_SUBMITED");
        await this.baseService.refreshRoute();
      } catch (error: any) {
        await this.baseService.showErrorMessage(error);
      } finally {
        await this.baseService.dismissLoading();
      }
    }
  }

  async onCancel() {
    if ((await this.docTypeInstance?.onBeforeCancel?.())?.skip || false) {
      return;
    }

    const confirmKey = "CANCEL";
    const msg = await this.baseService.getTranslate("_CONFIRM_CANCEL", { confirmKey: confirmKey });
    const confirm = await this.baseService.showInputConfirm(msg, confirmKey)
    if (confirm == 'confirm') {
      try {
        await this.baseService.showLoading();
        await this.api.updateDocument(this.documentTypeId(), this.documentId(), { docStatus: 'CANCELLED' });

        await this.docTypeInstance?.onAfterCancel?.()

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
    if (confirm == 'confirm') {
      try {
        await this.baseService.showLoading();
        await this.api.updateDocument(this.documentTypeId(), this.documentId(), { isDeleted: true });
        await this.baseService.dismissLoading();
        await this.baseService.showSuccessToast("_HAS_DELETED");
        await this.baseService.navigateTo(`/doc/${this.documentTypeId()}`, { replaceUrl: true });
      } catch (error: any) {
        await this.baseService.showErrorMessage(error);
      } finally {
        await this.baseService.dismissLoading();
      }
    }
  }

  async onPrint() {
    const data = {
      action: 'onPrint',
      formValue: this.formConfig()!.form.value,
      documentId: this.documentId(),
      documentType: this.documentType()
    }

    const dialogRef = this.dialog.open(PrintComponent, {
      data: data,
      maxWidth: "95vw",
      minWidth: "95vw",
      minHeight: "95vh",
      maxHeight: "95vh",
    });
  }

  async runServerActionScript(documentId: string, actionButton: any) {
    const body = {
      action: 'onActionButtonClick',
      actionButton: actionButton
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

  findComponent(key: string) {
    const component = this.formConfig()?.components.find(c => c.key == key);
    if (!component) {
      throw new Error(`Component with key ${key} not found`);
    }
    return component;
  }

  setProperty(key: string, property: keyof MyFormComponent, value: any) {
    const component = this.findComponent(key);
    component[property] = value;
  }

  getProperty(key: string, property: keyof MyFormComponent) {
    const component = this.findComponent(key);
    return component[property];
  }

  getValue(key: string) {
    return this.formConfig()?.form.value[key];
  }

  setValue(key: string, value: any) {
    this.formConfig()?.form.controls[key].setValue(value);
  }

  patchValues(values: { [key: string]: any }) {
    this.formConfig()?.form.patchValue(values);
  }

  setChildTableValue(tableKey: string, index: number, childKey: string, value: any) {
    const tableComponent = this.findComponent(tableKey);
    if (tableComponent.type !== 'table') {
      throw new Error(`Component with key ${tableKey} is not a table`);
    }
    tableComponent.value[index][childKey] = value;
    this.cd.markForCheck();
  }

  getChildTableValue(tableKey: string, index: number, childKey: string) {
    const tableComponent = this.findComponent(tableKey);
    if (tableComponent.type !== 'table') {
      throw new Error(`Component with key ${tableKey} is not a table`);
    }
    return tableComponent.value[index][childKey];
  }

}
