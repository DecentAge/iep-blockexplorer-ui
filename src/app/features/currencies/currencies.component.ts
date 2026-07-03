import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DataTableComponent, TableColumn, PaginationConfig } from '../../shared/components/data-table/data-table.component';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';

interface Currency {
  currency: string;
  code: string;
  name: string;
  accountRS?: string;
  account: string;
  currentSupply: number;
  maxSupply?: number;
  decimals: number;
  numberOfExchanges?: number;
  numberOfTransfers?: number;
  type: number;
}

@Component({
  selector: 'app-currencies',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent, AmountTQTPipe],
  template: `
    <div class="main-content">
      <div class="col-md-12">
        <app-data-table
          [title]="'Currencies'"
          [data]="currencies"
          [columns]="columns"
          [loading]="loading"
          [isReloading]="isReloading"
          [pagination]="paginationConfig"
          [emptyMessage]="'No currencies found.'"
          (reload)="loadCurrencies()"
          (pageChange)="onPageChange($event)">
        </app-data-table>

        <ng-template #currencyTemplate let-row>
          <span class="hash-link">{{ row.currency }}</span>
        </ng-template>

        <ng-template #codeTemplate let-row>
          <strong>{{ row.code }}</strong>
        </ng-template>

        <ng-template #nameTemplate let-row>
          <span>{{ row.name }}</span>
        </ng-template>

        <ng-template #issuerTemplate let-row>
          <span class="hash-link small">
            {{ row.accountRS || (row.account | slice:0:8) + '...' + (row.account | slice:-6) }}
          </span>
        </ng-template>

        <ng-template #currentSupplyTemplate let-row>
          <span class="amount-value">{{ formatSupply(row.currentSupply, row.decimals) }}</span>
        </ng-template>

        <ng-template #maxSupplyTemplate let-row>
          <span class="amount-value">{{ row.maxSupply ? formatSupply(row.maxSupply, row.decimals) : 'Unlimited' }}</span>
        </ng-template>

        <ng-template #exchangesTemplate let-row>
          <span>{{ row.numberOfExchanges || 0 }}</span>
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
export class CurrenciesComponent implements OnInit {
  @ViewChild('currencyTemplate', { static: true }) currencyTemplate!: TemplateRef<any>;
  @ViewChild('codeTemplate', { static: true }) codeTemplate!: TemplateRef<any>;
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;
  @ViewChild('issuerTemplate', { static: true }) issuerTemplate!: TemplateRef<any>;
  @ViewChild('currentSupplyTemplate', { static: true }) currentSupplyTemplate!: TemplateRef<any>;
  @ViewChild('maxSupplyTemplate', { static: true }) maxSupplyTemplate!: TemplateRef<any>;
  @ViewChild('exchangesTemplate', { static: true }) exchangesTemplate!: TemplateRef<any>;
  @ViewChild('transfersTemplate', { static: true }) transfersTemplate!: TemplateRef<any>;

  currencies: Currency[] = [];
  columns: TableColumn[] = [];
  loading: boolean = false;
  isReloading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 25;
  paginationConfig?: PaginationConfig;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.setupColumns();
    this.loadCurrencies();
  }

  setupColumns() {
    this.columns = [
      { key: 'currency', label: 'Currency ID', template: this.currencyTemplate },
      { key: 'code', label: 'Code', template: this.codeTemplate },
      { key: 'name', label: 'Name', template: this.nameTemplate },
      { key: 'account', label: 'Issuer', template: this.issuerTemplate },
      { key: 'currentSupply', label: 'Current Supply', template: this.currentSupplyTemplate },
      { key: 'maxSupply', label: 'Max Supply', template: this.maxSupplyTemplate },
      { key: 'numberOfExchanges', label: 'Exchanges', template: this.exchangesTemplate },
      { key: 'numberOfTransfers', label: 'Transfers', template: this.transfersTemplate }
    ];
  }

  loadCurrencies() {
    const wasLoaded = this.currencies.length > 0;
    if (wasLoaded) {
      this.isReloading = true;
    } else {
      this.loading = true;
    }

    const firstIndex = (this.currentPage - 1) * this.pageSize;
    const lastIndex = firstIndex + this.pageSize - 1;

    this.apiService.get<{ currencies: Currency[] }>('getAllCurrencies', {
      firstIndex: firstIndex,
      lastIndex: lastIndex
    }).subscribe({
      next: (response) => {
        this.currencies = response.currencies || [];
        this.loading = false;
        this.isReloading = false;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error loading currencies:', error);
        this.loading = false;
        this.isReloading = false;
      }
    });
  }

  formatSupply(supply: number, decimals: number): string {
    if (!supply) return '0';
    const amount = supply / Math.pow(10, decimals || 0);
    return amount.toLocaleString('en-US', { maximumFractionDigits: decimals });
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
    this.loadCurrencies();
  }
}
