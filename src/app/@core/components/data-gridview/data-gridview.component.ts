import { ChangeDetectorRef, Component, EventEmitter, Injectable, Input, NgZone, Output, } from '@angular/core';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { MyErpFieldType } from '@myerp/interfaces/interface';
import { CommonModule } from '@angular/common';
import { MyTranslatePipe } from '@myerp/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Injectable()
class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  // For internationalization, the `$localize` function from
  // the `@angular/localize` package can be used.
  firstPageLabel = `First page`;
  itemsPerPageLabel = `Items per page:`;
  lastPageLabel = `Last page`;

  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  nextPageLabel = 'Next page';
  previousPageLabel = 'Previous page';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return `Page 1 of 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Page ${page + 1} of ${amountPages}`;
  }
}

@Component({
  selector: 'myerp-data-gridview',
  imports: [
    DragDropModule, 
    MatPaginatorModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MyTranslatePipe
  ],
  templateUrl: './data-gridview.component.html',
  styleUrl: './data-gridview.component.scss',
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }]
})
export class MyDataGridView {
  startWidth: number = 0;
  currentSortKey?: string;
  sortBy?: "ASC" | "DESC";
  paginationOption!: MyDataGridPagination;

  @Input() config!: MyDataGridViewConfig;
  @Input() data: MyDataGridViewData[] = [];
  @Output("onSort") onSortEvent: EventEmitter<{sortField:any,sortBy:"ASC" | "DESC"}> = new EventEmitter();
  @Output("onSelect") onSelectEvent: EventEmitter<MyDataGridViewData> = new EventEmitter();
  @Output("onPageChange") onPageChangeEvent: EventEmitter<MyDataGridPagination> = new EventEmitter();


  constructor(private cd: ChangeDetectorRef, private ngZone: NgZone) {

  }

  ngOnInit() {
    if (!this.config) {
      throw new Error("config is required!");
    }
    this.currentSortKey = this.config.defaultSortKey;
    this.sortBy = this.config.defaultSortBy || 'ASC';
    this.paginationOption = this.config.paginationOption || {
      length: 100,
      pageIndex: 0,
      pageSize: 10,
      pageSizeOptions: [10, 20, 50, 100]
    };
    console.log(this.paginationOption)

  }
  

  onSort(column: MyDataGridViewColumn) {
    this.sortBy = column.key != this.currentSortKey ? 'ASC' : this.sortBy == 'ASC' ? 'DESC' : 'ASC';
    this.currentSortKey = column.key;
    this.onSortEvent.emit({sortField:column.key,sortBy:this.sortBy});
  }



  // // Filters
  // filters: any = {};
  // filteredData = [...this.data];

  // Drag & Drop Column Reorder
  omDropHeader(event: CdkDragDrop<any[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const previousIndex = this.data.findIndex((d: any) => d === event.item.data);
    // Move column in displayedColumns array
    moveItemInArray(this.config.columns, event.previousIndex, event.currentIndex);
  }

  // Apply Filters
  applyFilter() {

  }


  onResizeStarted(box: HTMLElement, column: any,) {
    this.startWidth = box.clientWidth
    this.cd.detectChanges();
  }

  onResize(self: HTMLElement, column: any, event: any) {
    this.ngZone.runOutsideAngular(() => {
      column.width = this.startWidth + event.distance.x
    });
  }

  onCheckAll(event: any) {
    this.data.forEach(d => d.isCheck = event.target.checked);
  }

  onSelect(data: MyDataGridViewData) {
    this.onSelectEvent.emit(data);
  }

  onPageChange(event: PageEvent) {
    this.paginationOption.length = event.length;
    this.paginationOption.pageIndex = event.pageIndex;
    this.emitPageChange();

  }

  onChangePageSize(size: number) {
    this.paginationOption.pageSize = size;
    this.emitPageChange();
  }

  emitPageChange(){
    this.onPageChangeEvent.emit(this.paginationOption);
  }


}

export interface MyDataGridViewConfig {
  columns: MyDataGridViewColumn[];
  defaultSortKey?: string;
  defaultSortBy?: "ASC" | "DESC";
  paginationOption?: MyDataGridPagination

}
export interface MyDataGridViewColumn {
  key: string;
  label: string;
  width?: number;
  sorting?: number;
  type: MyErpFieldType

}
export interface MyDataGridViewData {
  [key: string]: any;
  isCheck?: boolean;
}

export interface MyDataGridPagination {
  length: number;
  pageSize: number;
  pageIndex: number;
  pageSizeOptions: number[];
}


