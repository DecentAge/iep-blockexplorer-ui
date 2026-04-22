import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';
import { DataTableComponent, TableColumn, PaginationConfig } from '../../shared/components/data-table/data-table.component';

interface Block {
  block: string;
  height: number;
  timestamp: number;
  numberOfTransactions: number;
  totalAmountNQT: number;
  totalFeeNQT: number;
  generator: string;
}

@Component({
  selector: 'app-blocks',
  standalone: true,
  imports: [CommonModule, RouterModule, TimestampPipe, AmountTQTPipe, DataTableComponent],
  template: `
    <div class="main-content">
      <div class="col-md-12">
        <app-data-table
          [title]="'Recent Blocks'"
          [data]="blocks"
          [columns]="columns"
          [loading]="loading"
          [isReloading]="isReloading"
          [pagination]="paginationConfig"
          (pageChange)="onPageChange($event)"
          (reload)="reloadBlocks()">

          <ng-template #heightTemplate let-row="row">
            <strong class="block-height">{{ row.height | number }}</strong>
          </ng-template>

          <ng-template #blockIdTemplate let-row="row">
            <a [routerLink]="['/block', row.block]" class="hash-link">
              {{ row.block | slice:0:12 }}...{{ row.block | slice:-8 }}
            </a>
          </ng-template>

          <ng-template #transactionsTemplate let-row="row">
            <span [ngClass]="getTxLabelClass(row.numberOfTransactions)">
              {{ row.numberOfTransactions }}
            </span>
          </ng-template>

          <ng-template #amountTemplate let-row="row">
            <span class="amount-value">{{ (row.totalAmountNQT || 0) | amountTQT }} XIN</span>
          </ng-template>

          <ng-template #feeTemplate let-row="row">
            <span class="amount-value">{{ (row.totalFeeNQT || 0) | amountTQT }} XIN</span>
          </ng-template>

          <ng-template #generatorTemplate let-row="row">
            <a [routerLink]="['/account', row.generator]" class="hash-link small">
              {{ row.generator | slice:0:8 }}...{{ row.generator | slice:-6 }}
            </a>
          </ng-template>

          <ng-template #timestampTemplate let-row="row">
            <span class="timestamp">{{ row.timestamp | timestamp }}</span>
          </ng-template>

        </app-data-table>
      </div>
    </div>
  `,
  styleUrls: ['./blocks.component.scss']
})
export class BlocksComponent implements OnInit {
  @ViewChild('heightTemplate', { static: true }) heightTemplate!: TemplateRef<any>;
  @ViewChild('blockIdTemplate', { static: true }) blockIdTemplate!: TemplateRef<any>;
  @ViewChild('transactionsTemplate', { static: true }) transactionsTemplate!: TemplateRef<any>;
  @ViewChild('amountTemplate', { static: true }) amountTemplate!: TemplateRef<any>;
  @ViewChild('feeTemplate', { static: true }) feeTemplate!: TemplateRef<any>;
  @ViewChild('generatorTemplate', { static: true }) generatorTemplate!: TemplateRef<any>;
  @ViewChild('timestampTemplate', { static: true }) timestampTemplate!: TemplateRef<any>;

  blocks: Block[] = [];
  columns: TableColumn[] = [];
  currentPage: number = 1;
  pageSize: number = 25;
  loading: boolean = false;
  isReloading: boolean = false;
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    showPages: [1, 2, 3, 4, 5]
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.initializeColumns();
    this.loadBlocks();
    // Auto-refresh every 30 seconds
    setInterval(() => this.loadBlocks(), 30000);
  }

  initializeColumns() {
    this.columns = [
      { key: 'height', label: 'Height', template: this.heightTemplate },
      { key: 'block', label: 'Id', template: this.blockIdTemplate },
      { key: 'numberOfTransactions', label: 'Transactions', template: this.transactionsTemplate },
      { key: 'totalAmountNQT', label: 'Amount', template: this.amountTemplate },
      { key: 'totalFeeNQT', label: 'Fee', template: this.feeTemplate },
      { key: 'generator', label: 'Generator', template: this.generatorTemplate },
      { key: 'timestamp', label: 'Timestamp', template: this.timestampTemplate }
    ];
  }

  loadBlocks() {
    const wasLoaded = this.blocks.length > 0;
    if (wasLoaded) {
      this.isReloading = true;
    } else {
      this.loading = true;
    }

    const firstIndex = (this.currentPage - 1) * this.pageSize;
    const lastIndex = firstIndex + this.pageSize - 1;

    this.apiService.get<{ blocks: Block[] }>('getBlocks', {
      firstIndex: firstIndex,
      lastIndex: lastIndex
    }).subscribe({
      next: (response) => {
        this.blocks = response.blocks || [];
        this.loading = false;
        this.isReloading = false;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error loading blocks:', error);
        this.loading = false;
        this.isReloading = false;
      }
    });
  }

  updatePagination() {
    this.paginationConfig = {
      currentPage: this.currentPage,
      showPages: this.getPageNumbers()
    };
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = Math.max(1, this.currentPage - 2); i <= this.currentPage + 2; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadBlocks();
  }

  // Transaction count label logic matching the original blocks-controller.js
  getTxLabelClass(value: number): string {
    if (value === 0) {
      return 'tx-label label-default';
    } else if (value > 0 && value < 100) {
      return 'tx-label label-success';
    } else if (value >= 100 && value < 200) {
      return 'tx-label label-warning';
    } else if (value >= 200) {
      return 'tx-label label-danger';
    }
    return 'tx-label label-default';
  }

  reloadBlocks() {
    this.loadBlocks();
  }
}
