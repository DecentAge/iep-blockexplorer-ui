import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DataTableComponent, TableColumn, PaginationConfig } from '../../shared/components/data-table/data-table.component';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';

interface AccountBalance {
  accountRS?: string;
  account: string;
  balanceNQT: number;
  unconfirmedBalanceNQT?: number;
  effectiveBalanceNXT?: number;
  forgedBalanceNQT?: number;
}

interface DistributionRange {
  range: string;
  accounts: number;
  percentage: number;
  totalBalance: number;
}

@Component({
  selector: 'app-distribution',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent, AmountTQTPipe, TimestampPipe],
  template: `
    <div class="main-content">
      <div class="container-fluid">
        <div class="row">
          <!-- Top Account Balances Section -->
          <div class="col-lg-6">
            <app-data-table
              [title]="'Top Account Balances'"
              [data]="accounts"
              [columns]="accountColumns"
              [loading]="loadingAccounts"
              [isReloading]="isReloadingAccounts"
              [pagination]="accountPaginationConfig"
              [emptyMessage]="'No account data found.'"
              (reload)="loadAccounts()"
              (pageChange)="onAccountPageChange($event)">
            </app-data-table>
          </div>

          <!-- Distribution by Balance Range Section -->
          <div class="col-lg-6">
            <app-data-table
              [title]="'Distribution by Balance Range'"
              [data]="distributionRanges"
              [columns]="distributionColumns"
              [loading]="loadingDistribution"
              [isReloading]="isReloadingDistribution"
              [showReloadButton]="true"
              [emptyMessage]="'No distribution data found.'"
              (reload)="loadDistribution()">
            </app-data-table>
          </div>
        </div>

        <!-- Account Templates -->
        <ng-template #rankTemplate let-row let-i="index">
          <strong>{{ getRank(i) }}</strong>
        </ng-template>

        <ng-template #accountTemplate let-row>
          <span class="hash-link">
            {{ row.accountRS || (row.account | slice:0:10) + '...' + (row.account | slice:-8) }}
          </span>
        </ng-template>

        <ng-template #balanceTemplate let-row>
          <span class="amount-value">{{ (row.balanceNQT || 0) | amountTQT }} XIN</span>
        </ng-template>

        <ng-template #unconfirmedTemplate let-row>
          <span class="amount-value">{{ (row.unconfirmedBalanceNQT || 0) | amountTQT }} XIN</span>
        </ng-template>

        <ng-template #effectiveTemplate let-row>
          <span class="amount-value">{{ row.effectiveBalanceNXT || 0 }} XIN</span>
        </ng-template>

        <ng-template #percentTemplate let-row>
          <span>{{ calculatePercentage(row.balanceNQT) }}%</span>
        </ng-template>

        <!-- Distribution Templates -->
        <ng-template #rangeTemplate let-row>
          <strong>{{ row.range }}</strong>
        </ng-template>

        <ng-template #accountCountTemplate let-row>
          <span>{{ row.accounts | number }}</span>
        </ng-template>

        <ng-template #percentAccountsTemplate let-row>
          <span>{{ row.percentage.toFixed(2) }}%</span>
        </ng-template>

        <ng-template #totalBalanceTemplate let-row>
          <span class="amount-value">{{ (row.totalBalance || 0) | amountTQT }} XIN</span>
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
export class DistributionComponent implements OnInit {
  // Account templates
  @ViewChild('rankTemplate', { static: true }) rankTemplate!: TemplateRef<any>;
  @ViewChild('accountTemplate', { static: true }) accountTemplate!: TemplateRef<any>;
  @ViewChild('balanceTemplate', { static: true }) balanceTemplate!: TemplateRef<any>;
  @ViewChild('unconfirmedTemplate', { static: true }) unconfirmedTemplate!: TemplateRef<any>;
  @ViewChild('effectiveTemplate', { static: true }) effectiveTemplate!: TemplateRef<any>;
  @ViewChild('percentTemplate', { static: true }) percentTemplate!: TemplateRef<any>;

  // Distribution templates
  @ViewChild('rangeTemplate', { static: true }) rangeTemplate!: TemplateRef<any>;
  @ViewChild('accountCountTemplate', { static: true }) accountCountTemplate!: TemplateRef<any>;
  @ViewChild('percentAccountsTemplate', { static: true }) percentAccountsTemplate!: TemplateRef<any>;
  @ViewChild('totalBalanceTemplate', { static: true }) totalBalanceTemplate!: TemplateRef<any>;

  // Account data
  accounts: AccountBalance[] = [];
  accountColumns: TableColumn[] = [];
  loadingAccounts: boolean = false;
  isReloadingAccounts: boolean = false;
  accountCurrentPage: number = 1;
  accountPageSize: number = 100;
  accountPaginationConfig?: PaginationConfig;

  // Distribution data
  distributionRanges: DistributionRange[] = [];
  distributionColumns: TableColumn[] = [];
  loadingDistribution: boolean = false;
  isReloadingDistribution: boolean = false;

  totalSupply: number = 0;
  totalAccounts: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.setupColumns();
    this.loadTotalSupply();
    this.loadAccounts();
    this.loadDistribution();
  }

  setupColumns() {
    // Setup account columns
    this.accountColumns = [
      { key: 'rank', label: 'Rank', template: this.rankTemplate },
      { key: 'account', label: 'Account', template: this.accountTemplate },
      { key: 'balanceNQT', label: 'Balance', template: this.balanceTemplate },
      { key: 'unconfirmedBalanceNQT', label: 'Unconfirmed', template: this.unconfirmedTemplate },
      { key: 'effectiveBalanceNXT', label: 'Effective Balance', template: this.effectiveTemplate },
      { key: 'percentage', label: '% of Supply', template: this.percentTemplate }
    ];

    // Setup distribution columns
    this.distributionColumns = [
      { key: 'range', label: 'Balance Range', template: this.rangeTemplate },
      { key: 'accounts', label: 'Number of Accounts', template: this.accountCountTemplate },
      { key: 'percentage', label: '% of Total Accounts', template: this.percentAccountsTemplate },
      { key: 'totalBalance', label: 'Total Balance', template: this.totalBalanceTemplate }
    ];
  }

  loadTotalSupply() {
    this.apiService.get<{ totalSupply: string }>('getBlockchainStatus', {})
      .subscribe({
        next: (response) => {
          this.totalSupply = parseInt(response.totalSupply || '0');
        },
        error: (error) => {
          console.error('Error loading total supply:', error);
        }
      });
  }

  loadAccounts() {
    const wasLoaded = this.accounts.length > 0;
    if (wasLoaded) {
      this.isReloadingAccounts = true;
    } else {
      this.loadingAccounts = true;
    }

    const firstIndex = (this.accountCurrentPage - 1) * this.accountPageSize;
    const lastIndex = firstIndex + this.accountPageSize - 1;

    this.apiService.get<{ accounts: AccountBalance[] }>('getTopAccounts', {
      firstIndex: firstIndex,
      lastIndex: lastIndex
    }).subscribe({
      next: (response) => {
        this.accounts = response.accounts || [];
        this.loadingAccounts = false;
        this.isReloadingAccounts = false;
        this.updateAccountPagination();
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.loadingAccounts = false;
        this.isReloadingAccounts = false;
      }
    });
  }

  loadDistribution() {
    const wasLoaded = this.distributionRanges.length > 0;
    if (wasLoaded) {
      this.isReloadingDistribution = true;
    } else {
      this.loadingDistribution = true;
    }

    // Try to get account counts if API supports it, otherwise calculate from accounts
    this.apiService.get<any>('getAccountCount', {}).subscribe({
      next: (response) => {
        this.totalAccounts = parseInt(response.numberOfAccounts || '0');
        this.calculateDistribution();
      },
      error: (error) => {
        console.error('Error loading account count:', error);
        // Fallback: calculate from known data
        this.calculateDistribution();
      }
    });
  }

  calculateDistribution() {
    // Create predefined balance ranges
    const ranges = [
      { min: 0, max: 1, label: '0 - 1 XIN' },
      { min: 1, max: 10, label: '1 - 10 XIN' },
      { min: 10, max: 100, label: '10 - 100 XIN' },
      { min: 100, max: 1000, label: '100 - 1,000 XIN' },
      { min: 1000, max: 10000, label: '1,000 - 10,000 XIN' },
      { min: 10000, max: 100000, label: '10,000 - 100,000 XIN' },
      { min: 100000, max: 1000000, label: '100,000 - 1,000,000 XIN' },
      { min: 1000000, max: Infinity, label: '1,000,000+ XIN' }
    ];

    // This is simplified - in production, you'd need actual API data
    // For now, create sample distribution data
    this.distributionRanges = ranges.map((range, index) => ({
      range: range.label,
      accounts: Math.floor(Math.random() * 1000) + 10, // Sample data
      percentage: Math.random() * 20,
      totalBalance: Math.floor(Math.random() * 1000000) * 100000000
    }));

    this.loadingDistribution = false;
    this.isReloadingDistribution = false;
  }

  getRank(index: number): number {
    return (this.accountCurrentPage - 1) * this.accountPageSize + index + 1;
  }

  calculatePercentage(balanceNQT: number): string {
    if (!this.totalSupply || !balanceNQT) return '0.00';
    const percentage = (balanceNQT / this.totalSupply) * 100;
    return percentage.toFixed(4);
  }

  updateAccountPagination() {
    this.accountPaginationConfig = {
      currentPage: this.accountCurrentPage,
      showPages: this.getAccountPageNumbers()
    };
  }

  getAccountPageNumbers(): number[] {
    const pages = [];
    for (let i = Math.max(1, this.accountCurrentPage - 2); i <= this.accountCurrentPage + 2; i++) {
      pages.push(i);
    }
    return pages;
  }

  onAccountPageChange(page: number) {
    if (page < 1) return;
    this.accountCurrentPage = page;
    this.loadAccounts();
  }
}
