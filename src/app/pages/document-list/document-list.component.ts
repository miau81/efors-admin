import { Component } from '@angular/core';
import { ShareModule } from '../../@modules/share/share.module';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { MyERPDocType, MyErpFieldType } from '../../@interfaces/interface';
import { MyFormGenerator, MyFormGeneratorConfig } from 'myerp-core';
import { MyDataGridPagination, MyDataGridView, MyDataGridViewColumn, MyDataGridViewConfig, MyDataGridViewData } from '../../@core/myerp-data-gridview/myerp-data-gridview.component';
import { BaseService } from '../../services/base.service';

@Component({
  selector: 'app-document-list',
  imports: [ShareModule, MyDataGridView],
  templateUrl: './document-list.component.html',
  styleUrl: './document-list.component.scss'
})
export class DocumentListComponent {
  public title: string = '';
  public documentTypeId: string = '';
  public docs: any[] = [];
  public filterConfig?: MyFormGeneratorConfig;
  public datagridConfig!: MyDataGridViewConfig;
  public filter: any[] = [];
  

  constructor(private route: ActivatedRoute, private api: ApiService, private baseService: BaseService) {

  }

  async ngOnInit() {
    this.baseService.subscribeParam(this.route, async (p: any) => {
      this.documentTypeId = p['documentType'];
      await this.getDocumentType();
      await this.getDocuments();
    })

  }

  async getDocumentType() {
    const documentType: MyERPDocType = await this.api.getDocumentType(this.documentTypeId);
    this.title = documentType.label
    const fields = documentType.fields.sort((a, b) => (a.sorting || 0) - (b.sorting || 0)).filter(f => !(f.isHidden || f.hideInTable) && this.validTypeForTable(f.type));
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
      paginationOption:{
          length: 100,
          pageIndex: 0,
          pageSize: 10,
          pageSizeOptions: [10, 20, 50, 100]
      }
    }
  }

  async getDocuments() {
    
    const doclist: any = await this.api.getDocuments(this.documentTypeId, this.filter);
    this.docs = doclist.records;
    console.log(doclist)
  }


  validTypeForTable(type: MyErpFieldType) {
    switch (type) {
      case "section":
      case "tab":
      case "table":
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

  onAddNew(){
    this.baseService.navigateTo(`/doc/new/${this.documentTypeId}`);
  }


}
