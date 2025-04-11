import { Component } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { MyFormComponent, MyFormComponentType, MyFormGenerator, MyFormGeneratorConfig, MyFormTab } from 'myerp-core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { BaseService } from '../../services/base.service';
import { MyERPDocType, MyERPField, MyErpFieldType } from '../../@interfaces/interface';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-document',
  imports: [ShareModule, MyFormGenerator],
  templateUrl: './document.component.html',
  styleUrl: './document.component.scss'
})
export class DocumentComponent {
  public title: string = '';
  public tabs: any[] = [];
  public documentTypeId: string = '';
  public documentId: string = '';
  public formConfig!: MyFormGeneratorConfig;
  public form!: FormGroup;
  public document?: any;
  public isNew: boolean = true;

  constructor(private route: ActivatedRoute, private api: ApiService, private baseService: BaseService) {

  }

  async ngOnInit() {
    this.baseService.subscribeParam(this.route, async (p: any) => {
      this.documentTypeId = p['documentType'];
      this.documentId = p['id'];
      if (this.documentId) {
        this.isNew = false;
        await this.getDocumentById();
      }
      await this.getDocumentType();

    })
  }

  async getDocumentType() {
    const documentType: MyERPDocType = await this.api.getDocumentType(this.documentTypeId);
    this.title = documentType.label;

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

    this.formConfig = {
      tabs: tabs,
      form: this.form,
      initValue: this.document
    }

    console.log(this.formConfig)

  }

  async getDocumentById() {
    this.document = await this.api.getDocumentByField(this.documentTypeId, "id", this.documentId);
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
    const components = this.populateFieldsToFormComponents(this.baseService.sortDocumentFields(fields.filter(f => !f.sectionId && f.type != 'tab' && f.type != 'section' && !(f.hideInForm || f.isHidden))));
    if (components.length > 0) {
      sections.unshift({ key: '', label: '', components: components });
    }
    return sections;
  }

  populateFieldsToFormComponents(fields: MyERPField[]) {
    return fields.map(f => {
      const component: MyFormComponent = {
        key: f.id,
        label: f.label,
        col: f.formColumnSize || 'col-12 col-mg-4 col-lg-4',
        required: f.mandatory,
        value: f.defaultValue,
        sortOrder: f.sorting,
        type: f.isHidden ? "hidden" : f.isReadOnly ? "readOnly" : f.formComponentType || this.convertFieldTypeToFormComponentType(f.type),
        options: f.options
      }
      return component;
    })
  }

  convertFieldTypeToFormComponentType(type: MyErpFieldType): MyFormComponentType {
    switch (type) {
      case "boolean":
        return "checkbox";
      case "currency":
      case "number":
        return "number";
      case "date":
        return "datePicker";
      case "time":
        return "time";
      case "datetime":
        return "datetime-local";
      case "link":
        return "link"
      case "table":
        return "table";
      case "breakline":
        return "breakline";
      default:
        return "text";
    }
  }

  async onSave() {
    if (!this.formConfig.generator?.validateForm()) {
      await this.baseService.showWarningMessage('_FILL_REQUIRED_FIELDS');
      return;
    }
    try {
      if (this.isNew) {
        await this.api.createDocument(this.documentTypeId, this.formConfig.form.value);
      } else {
        await this.api.updateDocumentByField(this.documentTypeId, "id", this.documentId, this.formConfig.form.value);
      }
      await this.baseService.showSuccessToast("_SAVED");
    } catch (error: any) {
      await this.baseService.showErrorMessage(error);
    }

  }


}


