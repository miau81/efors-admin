import { Component } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { MyDataGridPagination, MyDataGridView, MyDataGridViewColumn, MyDataGridViewConfig, MyDataGridViewData, MyFormComponent, MyFormComponentType, MyFormGenerator, MyFormGeneratorConfig } from '@myerp/components';
import { BaseService } from '../../services/base.service';
import { MyERPDocType, MyERPField, MyErpFieldType, MyErpSortAndPagination } from '@myerp/interfaces/interface';
import { FormGroup } from '@angular/forms';
import { MyBackButton } from '../../@core/components/back-button/back-button.component';

@Component({
  selector: 'app-document-list',
  imports: [ShareModule, MyDataGridView, MyFormGenerator,MyBackButton],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss'
})
export class DocumentListComponent {
  public title: string = '';
  public documentTypeId: string = '';
  public docs: any[] = [];
  public filterConfig?: MyFormGeneratorConfig;
  public datagridConfig?: MyDataGridViewConfig;
  public filter: any = {};
  public pagination!: MyErpSortAndPagination;


  constructor(private route: ActivatedRoute, private api: ApiService, private baseService: BaseService) {

  }

  flush() {
    this.filterConfig = undefined;
    this.filter = {};
    this.docs = [];
    this.datagridConfig = undefined;
    this.pagination = { page: 1, limit: 10 };
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
      defaultSortBy: documentType.defaultSortBy || "ASC",
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
        tabs: [],
        sections: [],
        components: components
      }
    }

    this.pagination['sortField'] = documentType.defaultSorting || "id";
    this.pagination['sortBy'] = documentType.defaultSortBy || "ASC";
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
    const params: any = { ...this.filter, ... this.pagination }
    console.log(params, this.filter)
    const doclist: any = await this.api.getDocuments(this.documentTypeId, params);
    this.docs = doclist.records;
    this.datagridConfig!.paginationOption!.length = doclist.totalRecord
    // this.datagridConfig!.paginationOption!.pageSize = doclist.totalPage


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

  async onPageChange(pagination: MyDataGridPagination) {
    if (pagination.pageSize >= pagination.length) {
      pagination.pageIndex = 0;
    }

    this.pagination["page"] = pagination.pageIndex + 1;
    this.pagination["limit"] = pagination.pageSize;
    await this.getDocuments();
  }

  async onSort(sort: { sortField: string, sortBy: "ASC" | "DESC" }) {
    this.pagination["sortField"] = sort.sortField
    this.pagination["sortBy"] = sort.sortBy;
    await this.getDocuments();
  }

  async onFilter(e: { component: MyFormComponent, isInit: boolean }) {
    let filterPrefix;
    switch (e.component.type) {
      case "text":
        filterPrefix = "tf_";
        this.filter[`op_${e.component.key}`] = "like";
        console.log(this.filter, e.component.type)
        break;
      case "date":
        filterPrefix = "df_";
        this.filter[`type_${e.component.key}`] = "date";
        break;
      case "datetime-local":
        filterPrefix = "df_";
        this.filter[`type_${e.component.key}`] = "datetime";
        break;
      default:
        filterPrefix = "tf_";
    }
    if (e.component.value) {
      this.filter[`${filterPrefix}${e.component.key}`] = e.component.value;
    } else {
      delete this.filter[`${filterPrefix}${e.component.key}`];
    }

    await this.getDocuments();
  }

  onAddNew() {
    this.baseService.navigateTo(`/doc/new/${this.documentTypeId}`);
  }


}
