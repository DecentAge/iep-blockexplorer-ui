import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  template?: TemplateRef<any>;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages?: number;
  showPages?: number[];
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  @Input() title: string = '';
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() loading: boolean = false;
  @Input() isReloading: boolean = false;
  @Input() pagination?: PaginationConfig;
  @Input() showReloadButton: boolean = true;
  @Input() emptyMessage: string = 'No data found.';

  @Output() reload = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();

  onReload() {
    this.reload.emit();
  }

  onPageChange(page: number) {
    this.pageChange.emit(page);
  }

  isLastPageDisabled(): boolean {
    if (!this.pagination) return false;
    if (!this.pagination.totalPages) return false;
    if (!this.pagination.currentPage) return false;
    return this.pagination.currentPage >= this.pagination.totalPages;
  }
  showEllipsis(): boolean {
    if (!this.pagination || !this.pagination.totalPages || !this.pagination.showPages) return false;
    const lastShown = this.pagination.showPages[this.pagination.showPages.length - 1];
    return lastShown < this.pagination.totalPages - 1;
  }
}
