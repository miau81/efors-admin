import { Component } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { MyDataGridPagination, MyDataGridView, MyDataGridViewColumn, MyDataGridViewConfig, MyDataGridViewData, MyFormComponent, MyFormComponentType, MyFormGenerator, MyFormGeneratorConfig } from '@myerp/components';
import { BaseService } from '../../services/base.service';
import { MyERPDocType, MyERPField, MyErpFieldType } from '@myerp/interfaces/interface';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-document-list',
  imports: [ShareModule, MyDataGridView, MyFormGenerator],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss'
})
export class DocumentListComponent {
  public title: string = '';
  public documentTypeId: string = '';
  public docs: any[] = [];
  public filterConfig?: MyFormGeneratorConfig;
  public datagridConfig?: MyDataGridViewConfig;
  public filter: any[] = [];


  constructor(private route: ActivatedRoute, private api: ApiService, private baseService: BaseService) {

  }

  flush() {
    this.filterConfig = undefined;
    this.filter = [];
    this.docs = [];
    this.datagridConfig = undefined;
  }

  async ngOnInit() {
    this.baseService.subscribeParam(this.route, async (p: any) => {
      this.documentTypeId = p['documentType'];
      this.flush();
      await this.getDocumentType();
      await this.getDocuments();
    })
  }



  async getDocumentType() {
    const documentType: MyERPDocType = await this.api.getDocumentType(this.documentTypeId);
    this.title = documentType.label
    const fields = documentType.fields.sort((a, b) => (a.sorting || 0) - (b.sorting || 0)).filter(f => !f.isHidden && f.showInTable && this.validTypeForTable(f.type));
    const columns: MyDataGridViewColumn[] = fields.map(f => {
      return {
        key: f.id,
        label: f.label || '',
        type: f.type,
        width: f.tableColumnWidth || 100
      }
    })
    this.datagridConfig = {
      columns: columns,
      defaultSortKey: documentType.defaultSorting || "id",
      defaultSortBy: documentType.defaultSortBy || "asc",
      paginationOption: {
        length: 0,
        pageIndex: 0,
        pageSize: 10,
        pageSizeOptions: [10, 20, 50, 100]
      }
    }
    const filterFields = documentType.fields.filter(f => f.showInFilter).map(m => {
      return {
        ...m,
        type: m.type == "datetime" ? "date" : m.type,
        defaultValue: undefined,
        formColumnSize: "col-6 col-md-3 col-lg-2",
        mandatory: false,
        showInForm: true
      }
    });
    if (filterFields.length > 0) {
      let form!: FormGroup;
      const components = filterFields.map(f => this.populateFieldsToFormComponent(f));
      this.filterConfig = {
        form: form,
        tabs: [{
          key: '',
          sections: [{
            key: '',
            components: components
          }]
        }],
      }
    }
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
    return component;
  }

  populateFormType(field: MyERPField): MyFormComponentType {
    if (field.isHidden || !field.showInForm) {
      return "hidden";
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
      default:
        return "text";
    }
  }

  async getDocuments() {

    const doclist: any = await this.api.getDocuments(this.documentTypeId, this.filter);
    this.docs = doclist.records;
    this.datagridConfig!.paginationOption!.length = doclist.totalRecord
    this.datagridConfig!.paginationOption!.pageSize = doclist.totalPage
    this.datagridConfig!.paginationOption!.pageIndex = doclist.currentPage - 1;
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

  onSelect(data: MyDataGridViewData) {
    this.baseService.navigateTo(`/doc/${this.documentTypeId}/${data['id']}`);
  }

  onPageChange(pagination: MyDataGridPagination) {

  }

  onSort(column: MyDataGridViewColumn) {

  }

  onAddNew() {
    this.baseService.navigateTo(`/doc/new/${this.documentTypeId}`);
  }


}
