import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DataTableComponent, TableColumn, PaginationConfig } from '../../shared/components/data-table/data-table.component';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';
import { ModalService } from '../../shared/services/modal.service';

interface Transaction {
  Id: string;
  fullHash: string;
  type: number;
  subtype: number;
  timestamp: number;
  confirmations?: number;
  amountTQT: string;
  feeTQT: string;
  senderId?: string;
  senderRS?: string;
  recipientId?: string;
  recipientRS?: string;
}

const TRANSACTION_TYPE_NAMES: { [type: number]: { name: string; subtypes: { [subtype: number]: string } } } = {
  0: { name: 'Payment', subtypes: { 0: 'Ordinary Payment' } },
  1: {
    name: 'Messaging',
    subtypes: {
      0: 'Arbitrary Message',
      1: 'Alias Assignment',
      2: 'Poll Creation',
      3: 'Vote Casting',
      4: 'Hub Announcement',
      5: 'Account Info',
      6: 'Alias Sell',
      7: 'Alias Buy',
      8: 'Alias Delete',
      9: 'Phasing Vote Casting',
      10: 'Account Property',
      11: 'Account Property Delete'
    }
  },
  2: {
    name: 'Asset Exchange',
    subtypes: {
      0: 'Asset Issuance',
      1: 'Asset Transfer',
      2: 'Ask Order Placement',
      3: 'Bid Order Placement',
      4: 'Ask Order Cancellation',
      5: 'Bid Order Cancellation',
      6: 'Dividend Payment',
      7: 'Asset Delete',
      8: 'Asset Complete Delete'
    }
  },
  3: { name: 'Marketplace', subtypes: {} },
  4: {
    name: 'Account Control',
    subtypes: {
      0: 'Effective Balance Lease',
      1: 'Phasing Only'
    }
  },
  5: {
    name: 'Monetary System',
    subtypes: {
      0: 'Currency Issuance',
      1: 'Reserve Increase',
      2: 'Reserve Claim',
      3: 'Currency Transfer',
      4: 'Publish Exchange Offer',
      5: 'Exchange Buy',
      6: 'Exchange Sell',
      7: 'Currency Minting',
      8: 'Currency Deletion'
    }
  },
  7: {
    name: 'Shuffling',
    subtypes: {
      0: 'Shuffling Creation',
      1: 'Shuffling Registration',
      2: 'Shuffling Processing',
      3: 'Shuffling Recipients',
      4: 'Shuffling Verification',
      5: 'Shuffling Cancel'
    }
  },
  21: {
    name: 'Advanced Payment',
    subtypes: {
      0: 'Escrow Creation',
      1: 'Escrow Sign',
      2: 'Escrow Results',
      3: 'Subscription Creation',
      4: 'Subscription Cancel',
      5: 'Subscription Payment'
    }
  },
  22: {
    name: 'Automated Transactions',
    subtypes: {
      0: 'AT Creation',
      1: 'AT Payment'
    }
  }
};

export function transactionTypeName(type: number, subtype: number): string {
  const entry = TRANSACTION_TYPE_NAMES[type];
  if (entry) {
    return entry.subtypes[subtype] || entry.name;
  }
  return `Type ${type}.${subtype}`;
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
          <a class="hash-link" style="cursor:pointer" (click)="modal.open('transaction', row.Id)">
            {{ row.fullHash | slice:0:10 }}...{{ row.fullHash | slice:-8 }}
          </a>
        </ng-template>

        <ng-template #typeTemplate let-row>
          <span class="badge-type">{{ getTransactionTypeText(row.type, row.subtype) }}</span>
        </ng-template>

        <ng-template #senderTemplate let-row>
          <a class="hash-link small" style="cursor:pointer" (click)="modal.open('account', row.senderRS || row.senderId)">
            {{ row.senderRS || (row.senderId | slice:0:8) + '...' + (row.senderId | slice:-6) }}
          </a>
        </ng-template>

        <ng-template #recipientTemplate let-row>
          <a *ngIf="row.recipientRS || row.recipientId; else noRecipient"
             class="hash-link small" style="cursor:pointer" (click)="modal.open('account', row.recipientRS || row.recipientId)">
            {{ row.recipientRS || (row.recipientId | slice:0:8) + '...' + (row.recipientId | slice:-6) }}
          </a>
          <ng-template #noRecipient>
            <span class="text-muted">-</span>
          </ng-template>
        </ng-template>

        <ng-template #amountTemplate let-row>
          <span class="amount-value">{{ (row.amountTQT || '0') | amountTQT }} XIN</span>
        </ng-template>

        <ng-template #feeTemplate let-row>
          <span class="amount-value">{{ (row.feeTQT || '0') | amountTQT }} XIN</span>
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

  getTransactionTypeText = transactionTypeName;

  constructor(private apiService: ApiService, public modal: ModalService) {}

  ngOnInit() {
    this.setupColumns();
    this.loadTransactions();
    setInterval(() => this.loadTransactions(), 30000);
  }

  setupColumns() {
    this.columns = [
      { key: 'fullHash', label: 'Transaction Hash', template: this.transactionTemplate },
      { key: 'type', label: 'Type', template: this.typeTemplate },
      { key: 'senderRS', label: 'From', template: this.senderTemplate },
      { key: 'recipientRS', label: 'To', template: this.recipientTemplate },
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
