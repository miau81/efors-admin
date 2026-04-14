import { ChangeDetectionStrategy, ChangeDetectorRef, Component, input, output, inject, signal, effect, NgZone, Injectable } from '@angular/core';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { MyErpFieldType } from '../../../@interfaces/interface';
import { CommonModule } from '@angular/common';
import { MyTranslatePipe } from '../../pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Angular 21 Signal-based Custom Paginator
@Injectable()
class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  firstPageLabel = `First page`;
  itemsPerPageLabel = `Items per page:`;
  lastPageLabel = `Last page`;
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

// Angular 21 Signal-based Data GridView
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
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyDataGridView {
  // Using input() from Angular 17+
  config = input.required<MyDataGridViewConfig>();
  data = input.required<MyDataGridViewData[]>();

  // Using output() from Angular 17+
  onSort = output<{ sortField: any; sortBy: "ASC" | "DESC" }>();
  onSelect = output<MyDataGridViewData>();
  onPageChange = output<MyDataGridPagination>();

  // Signals for internal state
  private readonly _startWidth = signal(0);
  readonly currentSortKey = signal<string | undefined>(undefined);
  readonly sortBy = signal<"ASC" | "DESC">("ASC");
  readonly paginationOption = signal<MyDataGridPagination>({
    length: 100,
    pageIndex: 0,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100]
  });

  // DI using inject()
  private readonly cd = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  constructor() {
    // Effect to detect changes when signals update
    effect(() => {
      const pagination = this.paginationOption();
      this.cd.markForCheck();
    });
  }

  ngOnInit() {
    const cfg = this.config();
    if (!cfg) {
      throw new Error("config is required!");
    }
    this.currentSortKey.set(cfg.defaultSortKey);
    this.sortBy.set(cfg.defaultSortBy || 'ASC');
    this.paginationOption.set(cfg.paginationOption || {
      length: 100,
      pageIndex: 0,
      pageSize: 10,
      pageSizeOptions: [10, 20, 50, 100]
    });
  }

  onSortHandler(column: MyDataGridViewColumn) {
    const newSortBy: "ASC" | "DESC" = column.key !== this.currentSortKey() ? "ASC" : this.sortBy() === "ASC" ? "DESC" : "ASC";
    this.sortBy.set(newSortBy);
    this.currentSortKey.set(column.key);
    this.onSort.emit({ sortField: column.key, sortBy: newSortBy });
  }

  // Drag & Drop Column Reorder
  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    moveItemInArray(this.config().columns, event.previousIndex, event.currentIndex);
  }

  // Apply Filters
  applyFilter() {
    // Filter implementation
  }

  onResizeStarted(box: HTMLElement, column: any) {
    this._startWidth.set(box.clientWidth);
    this.cd.detectChanges();
  }

  onResize(self: HTMLElement, column: any, event: any) {
    this.ngZone.runOutsideAngular(() => {
      column.width = this._startWidth() + event.distance.x;
    });
  }

  onCheckAll(event: any) {
    this.data().forEach(d => d.isCheck = event.target.checked);
  }

  onSelectHandler(data: MyDataGridViewData) {
    this.onSelect.emit(data);
  }

  onPageChangeHandler(event: PageEvent) {
    this.paginationOption.update(p => ({
      ...p,
      length: event.length,
      pageIndex: event.pageIndex
    }));
    this.emitPageChange();
  }

  onChangePageSize(size: number) {
    this.paginationOption.update(p => ({
      ...p,
      pageSize: size
    }));
    this.emitPageChange();
  }

  private emitPageChange() {
    this.onPageChange.emit(this.paginationOption());
  }
}

export interface MyDataGridViewConfig {
  columns: MyDataGridViewColumn[];
  defaultSortKey?: string;
  defaultSortBy?: "ASC" | "DESC";
  paginationOption?: MyDataGridPagination;
}

export interface MyDataGridViewColumn {
  key: string;
  label: string;
  width?: number;
  sorting?: number;
  type: MyErpFieldType;
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
