import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';
import { DataTableComponent, TableColumn, PaginationConfig } from '../../shared/components/data-table/data-table.component';
import { ModalService } from '../../shared/services/modal.service';
interface Block {
  block: string;
  height: number;
  timestamp: number;
  numberOfTransactions: number;
  totalAmountTQT: string;
  totalFeeTQT: string;
  generatorRS: string;
  generator: string;
  baseTarget: string;
  cumulativeDifficulty: string;
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
            <a class="block-height" style="cursor:pointer" (click)="modal.open('block', row.block)"><strong>{{ row.height }}</strong></a>
          </ng-template>
          <ng-template #blockIdTemplate let-row="row">
            <a class="hash-link" style="cursor:pointer" (click)="modal.open('block', row.block)">{{ row.block }}</a>
          </ng-template>
          <ng-template #transactionsTemplate let-row="row">
            <span [ngClass]="getTxLabelClass(row.numberOfTransactions)">
              {{ row.numberOfTransactions }}
            </span>
          </ng-template>
          <ng-template #amountTemplate let-row="row">
            {{ (row.totalAmountTQT || '0') | amountTQT }}
          </ng-template>
          <ng-template #feeTemplate let-row="row">
            {{ (row.totalFeeTQT || '0') | amountTQT }}
          </ng-template>
          <ng-template #generatorTemplate let-row="row">
            <a class="hash-link" style="cursor:pointer" (click)="modal.open('account', row.generatorRS || row.generator)">{{ row.generatorRS }}</a>
          </ng-template>
          <ng-template #timestampTemplate let-row="row">
            {{ row.timestamp | timestamp }}
          </ng-template>
          <ng-template #targetTemplate let-row="row">
            {{ row.baseTarget }} / {{ row.cumulativeDifficulty }}
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
  @ViewChild('targetTemplate', { static: true }) targetTemplate!: TemplateRef<any>;
  blocks: Block[] = [];
  columns: TableColumn[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  loading: boolean = false;
  isReloading: boolean = false;
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalPages: 100,
    showPages: [1, 2, 3, 4, 5]
  };
  constructor(private apiService: ApiService, public modal: ModalService) {}
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
      { key: 'numberOfTransactions', label: 'Txs', template: this.transactionsTemplate },
      { key: 'totalAmountTQT', label: 'Amount', template: this.amountTemplate },
      { key: 'totalFeeTQT', label: 'Fee', template: this.feeTemplate },
      { key: 'generatorRS', label: 'Generator', template: this.generatorTemplate },
      { key: 'timestamp', label: 'Date', template: this.timestampTemplate },
      { key: 'baseTarget', label: 'Target / Difficulty', template: this.targetTemplate }
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
      totalPages: 100,
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
