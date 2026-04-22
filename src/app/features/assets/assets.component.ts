import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DataTableComponent, TableColumn, PaginationConfig } from '../../shared/components/data-table/data-table.component';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';

interface Asset {
  asset: string;
  name: string;
  description?: string;
  accountRS?: string;
  account: string;
  quantityQNT: number;
  decimals: number;
  numberOfAccounts?: number;
  numberOfTrades?: number;
  numberOfTransfers?: number;
}

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent, AmountTQTPipe],
  template: `
    <div class="main-content">
      <div class="col-md-12">
        <app-data-table
          [title]="'Assets'"
          [data]="assets"
          [columns]="columns"
          [loading]="loading"
          [isReloading]="isReloading"
          [pagination]="paginationConfig"
          [emptyMessage]="'No assets found.'"
          (reload)="loadAssets()"
          (pageChange)="onPageChange($event)">
        </app-data-table>

        <ng-template #assetTemplate let-row>
          <span class="hash-link">{{ row.asset }}</span>
        </ng-template>

        <ng-template #nameTemplate let-row>
          <strong>{{ row.name }}</strong>
        </ng-template>

        <ng-template #issuerTemplate let-row>
          <span class="hash-link small">
            {{ row.accountRS || (row.account | slice:0:8) + '...' + (row.account | slice:-6) }}
          </span>
        </ng-template>

        <ng-template #quantityTemplate let-row>
          <span class="amount-value">{{ formatQuantity(row.quantityQNT, row.decimals) }}</span>
        </ng-template>

        <ng-template #accountsTemplate let-row>
          <span>{{ row.numberOfAccounts || 0 }}</span>
        </ng-template>

        <ng-template #tradesTemplate let-row>
          <span>{{ row.numberOfTrades || 0 }}</span>
        </ng-template>

        <ng-template #transfersTemplate let-row>
          <span>{{ row.numberOfTransfers || 0 }}</span>
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
export class AssetsComponent implements OnInit {
  @ViewChild('assetTemplate', { static: true }) assetTemplate!: TemplateRef<any>;
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;
  @ViewChild('issuerTemplate', { static: true }) issuerTemplate!: TemplateRef<any>;
  @ViewChild('quantityTemplate', { static: true }) quantityTemplate!: TemplateRef<any>;
  @ViewChild('accountsTemplate', { static: true }) accountsTemplate!: TemplateRef<any>;
  @ViewChild('tradesTemplate', { static: true }) tradesTemplate!: TemplateRef<any>;
  @ViewChild('transfersTemplate', { static: true }) transfersTemplate!: TemplateRef<any>;

  assets: Asset[] = [];
  columns: TableColumn[] = [];
  loading: boolean = false;
  isReloading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 25;
  paginationConfig?: PaginationConfig;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.setupColumns();
    this.loadAssets();
  }

  setupColumns() {
    this.columns = [
      { key: 'asset', label: 'Asset ID', template: this.assetTemplate },
      { key: 'name', label: 'Name', template: this.nameTemplate },
      { key: 'account', label: 'Issuer', template: this.issuerTemplate },
      { key: 'quantityQNT', label: 'Total Quantity', template: this.quantityTemplate },
      { key: 'numberOfAccounts', label: 'Accounts', template: this.accountsTemplate },
      { key: 'numberOfTrades', label: 'Trades', template: this.tradesTemplate },
      { key: 'numberOfTransfers', label: 'Transfers', template: this.transfersTemplate }
    ];
  }

  loadAssets() {
    const wasLoaded = this.assets.length > 0;
    if (wasLoaded) {
      this.isReloading = true;
    } else {
      this.loading = true;
    }

    const firstIndex = (this.currentPage - 1) * this.pageSize;
    const lastIndex = firstIndex + this.pageSize - 1;

    this.apiService.get<{ assets: Asset[] }>('getAllAssets', {
      firstIndex: firstIndex,
      lastIndex: lastIndex
    }).subscribe({
      next: (response) => {
        this.assets = response.assets || [];
        this.loading = false;
        this.isReloading = false;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error loading assets:', error);
        this.loading = false;
        this.isReloading = false;
      }
    });
  }

  formatQuantity(quantityQNT: number, decimals: number): string {
    if (!quantityQNT) return '0';
    const quantity = quantityQNT / Math.pow(10, decimals || 0);
    return quantity.toLocaleString('en-US', { maximumFractionDigits: decimals });
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
    this.loadAssets();
  }
}
