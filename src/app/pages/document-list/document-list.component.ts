import { Component, ChangeDetectorRef, inject, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { MyDataGridPagination, MyDataGridView, MyDataGridViewColumn, MyDataGridViewConfig, MyDataGridViewData, MyFormComponent, MyFormComponentType, MyFormGenerator, MyFormGeneratorConfig } from '../../@core/components';
import { BaseService } from '../../services/base.service';
import { MyERPDocType, MyERPField, MyErpFieldType, MyErpSortAndPagination } from '../../@interfaces/interface';
import { FormGroup } from '@angular/forms';
import { MyBackButton } from '../../@core/components/back-button/back-button.component';

@Component({
  selector: 'app-document-list',
  imports: [ShareModule, MyDataGridView, MyFormGenerator,MyBackButton],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentListComponent {
  // Using signals for reactive state
  readonly title = signal('');
  readonly documentTypeId = signal('');
  readonly docs = signal<any[]>([]);
  readonly filterConfig = signal<MyFormGeneratorConfig | undefined>(undefined);
  readonly datagridConfig = signal<MyDataGridViewConfig | undefined>(undefined);
  readonly filter = signal<any>({});
  readonly pagination = signal<MyErpSortAndPagination>({ _page: 1, _limit: 10 });

  // Using inject()
  private readonly route = inject(ActivatedRoute);
  readonly api = inject(ApiService);
  readonly baseService = inject(BaseService);
  private readonly cd = inject(ChangeDetectorRef);

  constructor() {
    // Effect to detect changes
    effect(() => {
      const _ = this.docs();
      const __ = this.filterConfig();
      const ___ = this.datagridConfig();
      this.cd.markForCheck();
    });
  }

  flush() {
    this.filterConfig.set(undefined);
    this.filter.set({});
    this.docs.set([]);
    this.datagridConfig.set(undefined);
    this.pagination.set({ _page: 1, _limit: 10 });
  }

  async ngOnInit() {
    this.baseService.subscribeParam(this.route, async (p: any) => {
      this.documentTypeId.set(p['documentType']);
      this.flush();
      await this.getDocumentType();
      await this.getDocuments();
    })
  }



  async getDocumentType() {
    const documentType: MyERPDocType = await this.api.getDocumentType(this.documentTypeId());
    this.title.set(documentType.label);
    const fields = documentType.fields.sort((a, b) => (a.sorting || 0) - (b.sorting || 0)).filter(f => !f.isHidden && f.showInTable && this.validTypeForTable(f.type));
    const columns: MyDataGridViewColumn[] = fields.map(f => {
      return {
        key: f.id,
        label: f.label || '',
        type: f.type,
        width: f.tableColumnWidth || 100
      }
    })
    this.datagridConfig.set({
      columns: columns,
      defaultSortKey: documentType.defaultSorting || "id",
      defaultSortBy: documentType.defaultSortBy || "ASC",
      paginationOption: {
        length: 0,
        pageIndex: 0,
        pageSize: 10,
        pageSizeOptions: [10, 20, 50, 100]
      }
    });
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
      this.filterConfig.set({
        form: form,
        tabs: [],
        sections: [],
        components: components
      });
    }

    this.pagination.set({
      ...this.pagination(),
      '_sortField': documentType.defaultSorting || "id",
      '_sortDirection': documentType.defaultSortBy || "ASC"
    });
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
    const params: any = { ...this.filter(), ... this.pagination() }
    const doclist: any = await this.api.getDocuments(this.documentTypeId(), params);
    this.docs.set(doclist.records);
    const currentConfig = this.datagridConfig();
    if (currentConfig && currentConfig.paginationOption) {
      this.datagridConfig.set({
        ...currentConfig,
        paginationOption: {
          ...currentConfig.paginationOption,
          length: doclist.totalRecord
        }
      });
    }
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
    this.baseService.navigateTo(`/doc/${this.documentTypeId()}/${data['id']}`);
  }

  async onPageChange(pagination: MyDataGridPagination) {
    if (pagination.pageSize >= pagination.length) {
      pagination.pageIndex = 0;
    }

    this.pagination.set({
      ...this.pagination(),
      "_page": pagination.pageIndex + 1,
      "_limit": pagination.pageSize
    });
    await this.getDocuments();
  }

  async onSort(sort: { sortField: string, sortBy: "ASC" | "DESC" }) {
    this.pagination.set({
      ...this.pagination(),
      "_sortField": sort.sortField,
      "_sortDirection": sort.sortBy
    });
    await this.getDocuments();
  }

  async onFilter(e: { component: MyFormComponent, isInit: boolean }) {
    const currentFilter = { ...this.filter() };
    
    switch (e.component.type) {
      case "text":
        currentFilter[`op_${e.component.key}`] = "like";
        break;
      case "date":
        currentFilter[`type_${e.component.key}`] = "date";
        break;
      case "datetime-local":
        currentFilter[`type_${e.component.key}`] = "datetime";
        break;
      default:
        currentFilter[`op_${e.component.key}`] = "like";
        break;
    }
    if (e.component.value) {
      currentFilter[e.component.key] = e.component.value;
    } else {
      delete currentFilter[e.component.key];
    }

    this.filter.set(currentFilter);
    await this.getDocuments();
  }

  onAddNew() {
    this.baseService.navigateTo(`/doc/new/${this.documentTypeId()}`);
  }


}
