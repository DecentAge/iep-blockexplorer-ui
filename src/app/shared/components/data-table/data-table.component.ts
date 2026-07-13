import { Component, Input, Output, EventEmitter, TemplateRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
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
export class DataTableComponent implements OnChanges, OnDestroy {
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

  lastUpdated?: Date;

  private displaySpinner = false;
  private spinnerTimer?: ReturnType<typeof setTimeout>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !this.loading && this.data && this.data.length > 0) {
      this.lastUpdated = new Date();
    }
  }

  ngOnDestroy(): void {
    if (this.spinnerTimer) clearTimeout(this.spinnerTimer);
  }

  onReload() {
    this.displaySpinner = true;
    if (this.spinnerTimer) clearTimeout(this.spinnerTimer);
    this.spinnerTimer = setTimeout(() => { this.displaySpinner = false; }, 500);
    this.reload.emit();
  }

  get spinning(): boolean {
    return this.isReloading || this.displaySpinner;
  }

  get currentPage(): number {
    return this.pagination?.currentPage || 1;
  }

  get pages(): number[] {
    const total = this.pagination?.totalPages;
    const raw = this.pagination?.showPages;
    if (raw && raw.length) {
      return raw.filter(p => p >= 1 && (!total || p <= total));
    }
    const cur = this.currentPage;
    const upper = total ?? cur + 2;
    const out: number[] = [];
    for (let i = Math.max(1, cur - 2); i <= Math.min(upper, cur + 2); i++) out.push(i);
    return out.length ? out : [1];
  }

  hasPrev(): boolean {
    return this.currentPage > 1;
  }

  hasNext(): boolean {
    const total = this.pagination?.totalPages;
    return total ? this.currentPage < total : true;
  }

  onPageChange(page: number) {
    const total = this.pagination?.totalPages;
    let target = Math.max(1, Math.floor(page));
    if (total) target = Math.min(target, total);
    if (target === this.currentPage) return;
    this.pageChange.emit(target);
  }
}
