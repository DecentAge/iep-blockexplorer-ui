import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DataTableComponent, TableColumn, PaginationConfig } from '../../shared/components/data-table/data-table.component';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';

interface Transaction {
  transaction: string;
  type: number;
  subtype: number;
  timestamp: number;
  amountTQT: string;
  feeTQT: string;
  sender: string;
  senderRS?: string;
  recipient?: string;
  recipientRS?: string;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent, TimestampPipe, AmountTQTPipe],
  template: `
    <div class="main-content">
      <div class="col-md-12">
        <app-data-table
          [title]="'Transactions'"
          [data]="transactions"
          [columns]="columns"
          [loading]="loading"
          [isReloading]="isReloading"
          [pagination]="paginationConfig"
          [emptyMessage]="'No transactions found.'"
          (reload)="loadTransactions()"
          (pageChange)="onPageChange($event)">
        </app-data-table>

        <ng-template #transactionTemplate let-row>
          <a [routerLink]="['/transaction', row.transaction]" class="hash-link">
            {{ row.transaction | slice:0:10 }}...{{ row.transaction | slice:-8 }}
          </a>
        </ng-template>

        <ng-template #typeTemplate let-row>
          <span class="badge-type">{{ getTransactionTypeText(row.type, row.subtype) }}</span>
        </ng-template>

        <ng-template #senderTemplate let-row>
          <a class="hash-link small" [routerLink]="['/account', row.senderRS || row.sender]">
            {{ row.senderRS || (row.sender | slice:0:8) + '...' + (row.sender | slice:-6) }}
          </a>
        </ng-template>

        <ng-template #recipientTemplate let-row>
          <a class="hash-link small" *ngIf="row.recipient || row.recipientRS; else noRecipient" [routerLink]="['/account', row.recipientRS || row.recipient]">
            {{ row.recipientRS || (row.recipient | slice:0:8) + '...' + (row.recipient | slice:-6) }}
          </a>
          <ng-template #noRecipient>
            <span class="text-muted">-</span>
          </ng-template>
        </ng-template>

        <ng-template #amountTemplate let-row>
          <span class="amount-value">{{ (row.amountTQT || 0) | amountTQT }} XIN</span>
        </ng-template>

        <ng-template #feeTemplate let-row>
          <span class="amount-value">{{ (row.feeTQT || 0) | amountTQT }} XIN</span>
        </ng-template>

        <ng-template #timestampTemplate let-row>
          <span class="timestamp">{{ row.timestamp | timestamp }}</span>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .main-content {
      padding: 2rem 0;
    }
  `]
})
export class TransactionsComponent implements OnInit {
  @ViewChild('transactionTemplate', { static: true }) transactionTemplate!: TemplateRef<any>;
  @ViewChild('typeTemplate', { static: true }) typeTemplate!: TemplateRef<any>;
  @ViewChild('senderTemplate', { static: true }) senderTemplate!: TemplateRef<any>;
  @ViewChild('recipientTemplate', { static: true }) recipientTemplate!: TemplateRef<any>;
  @ViewChild('amountTemplate', { static: true }) amountTemplate!: TemplateRef<any>;
  @ViewChild('feeTemplate', { static: true }) feeTemplate!: TemplateRef<any>;
  @ViewChild('timestampTemplate', { static: true }) timestampTemplate!: TemplateRef<any>;

  transactions: Transaction[] = [];
  columns: TableColumn[] = [];
  loading: boolean = false;
  isReloading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 25;
  paginationConfig?: PaginationConfig;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.setupColumns();
    this.loadTransactions();
    setInterval(() => this.loadTransactions(), 30000);
  }

  setupColumns() {
    this.columns = [
      { key: 'transaction', label: 'Transaction Hash', template: this.transactionTemplate },
      { key: 'type', label: 'Type', template: this.typeTemplate },
      { key: 'sender', label: 'From', template: this.senderTemplate },
      { key: 'recipient', label: 'To', template: this.recipientTemplate },
      { key: 'amountTQT', label: 'Amount', template: this.amountTemplate },
      { key: 'feeTQT', label: 'Fee', template: this.feeTemplate },
      { key: 'timestamp', label: 'Age', template: this.timestampTemplate }
    ];
  }

  loadTransactions() {
    const wasLoaded = this.transactions.length > 0;
    if (wasLoaded) {
      this.isReloading = true;
    } else {
      this.loading = true;
    }

    const firstIndex = (this.currentPage - 1) * this.pageSize;
    const lastIndex = firstIndex + this.pageSize - 1;

    this.apiService.get<{ transactions: Transaction[] }>('getTransactions', {
      firstIndex: firstIndex,
      lastIndex: lastIndex
    }).subscribe({
      next: (response) => {
        this.transactions = response.transactions || [];
        this.loading = false;
        this.isReloading = false;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.loading = false;
        this.isReloading = false;
      }
    });
  }

  getTransactionTypeText(type: number, subtype: number): string {
    if (type === 0 && subtype === 0) return 'Payment';
    if (type === 1) return 'Message';
    if (type === 2) return 'Asset';
    if (type === 3) return 'Digital Goods';
    if (type === 4) return 'Account Control';
    if (type === 5) return 'Currency';
    return `${type}.${subtype}`;
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
    if (page < 1) return;
    this.currentPage = page;
    this.loadTransactions();
  }
}
