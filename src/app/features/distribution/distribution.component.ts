import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { DataTableComponent, TableColumn, PaginationConfig } from '../../shared/components/data-table/data-table.component';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';
import { ModalService } from '../../shared/services/modal.service';
import { environment } from '../../../environments/environment';

interface AccountBalance {
  account: string;
  accountRS?: string;
  balanceTQT: string;
  unconfirmedBalanceTQT?: string;
  effectiveBalance?: number;
}

interface AccountBalancesResponse {
  balances?: AccountBalance[];
  total?: number;
}

interface DistributionSlice {
  accountsAmount: number;
}

interface DistributionRange {
  range: string;
  accounts: number;
  percentage: number;
}

const PAGE_SIZE = 25;
const MAX_PAGE_INDEX = 100;
const XIN = environment.tokenQuants;

const RANGES = [
  { min: 0, max: 1, label: '0 - 1 XIN' },
  { min: 1, max: 10, label: '1 - 10 XIN' },
  { min: 10, max: 100, label: '10 - 100 XIN' },
  { min: 100, max: 1000, label: '100 - 1,000 XIN' },
  { min: 1000, max: 10000, label: '1,000 - 10,000 XIN' },
  { min: 10000, max: 100000, label: '10,000 - 100,000 XIN' },
  { min: 100000, max: 1000000, label: '100,000 - 1,000,000 XIN' },
  { min: 1000000, max: environment.initialSupply, label: '1,000,000+ XIN' }
];

@Component({
  selector: 'app-distribution',
  standalone: true,
  imports: [CommonModule, DataTableComponent, AmountTQTPipe],
  template: `
    <div class="main-content">
      <div class="container-fluid">
        <div class="row">
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

        <ng-template #rankTemplate let-row let-i="index">
          <strong>{{ getRank(i) }}</strong>
        </ng-template>

        <ng-template #accountTemplate let-row>
          <a class="hash-link" style="cursor:pointer" (click)="modal.open('account', row.accountRS || row.account)">
            {{ row.accountRS || row.account }}
          </a>
        </ng-template>

        <ng-template #balanceTemplate let-row>
          <span class="amount-value">{{ row.balanceTQT | amountTQT }} XIN</span>
        </ng-template>

        <ng-template #effectiveTemplate let-row>
          <span class="amount-value">{{ (row.effectiveBalance || 0) | number }} XIN</span>
        </ng-template>

        <ng-template #percentTemplate let-row>
          <span>{{ supplyPercentage(row.balanceTQT) }}%</span>
        </ng-template>

        <ng-template #rangeTemplate let-row>
          <strong>{{ row.range }}</strong>
        </ng-template>

        <ng-template #accountCountTemplate let-row>
          <span>{{ row.accounts | number }}</span>
        </ng-template>

        <ng-template #percentAccountsTemplate let-row>
          <span>{{ row.percentage.toFixed(2) }}%</span>
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
  @ViewChild('rankTemplate', { static: true }) rankTemplate!: TemplateRef<any>;
  @ViewChild('accountTemplate', { static: true }) accountTemplate!: TemplateRef<any>;
  @ViewChild('balanceTemplate', { static: true }) balanceTemplate!: TemplateRef<any>;
  @ViewChild('effectiveTemplate', { static: true }) effectiveTemplate!: TemplateRef<any>;
  @ViewChild('percentTemplate', { static: true }) percentTemplate!: TemplateRef<any>;
  @ViewChild('rangeTemplate', { static: true }) rangeTemplate!: TemplateRef<any>;
  @ViewChild('accountCountTemplate', { static: true }) accountCountTemplate!: TemplateRef<any>;
  @ViewChild('percentAccountsTemplate', { static: true }) percentAccountsTemplate!: TemplateRef<any>;

  accounts: AccountBalance[] = [];
  accountColumns: TableColumn[] = [];
  loadingAccounts = false;
  isReloadingAccounts = false;
  accountCurrentPage = 1;
  accountPaginationConfig?: PaginationConfig;

  distributionRanges: DistributionRange[] = [];
  distributionColumns: TableColumn[] = [];
  loadingDistribution = false;
  isReloadingDistribution = false;

  totalAccounts = 0;

  constructor(private apiService: ApiService, public modal: ModalService) {}

  ngOnInit() {
    this.accountColumns = [
      { key: 'rank', label: 'Rank', template: this.rankTemplate },
      { key: 'accountRS', label: 'Account', template: this.accountTemplate },
      { key: 'balanceTQT', label: 'Balance', template: this.balanceTemplate },
      { key: 'effectiveBalance', label: 'Effective Balance', template: this.effectiveTemplate },
      { key: 'percentage', label: '% of Supply', template: this.percentTemplate }
    ];
    this.distributionColumns = [
      { key: 'range', label: 'Balance Range', template: this.rangeTemplate },
      { key: 'accounts', label: 'Number of Accounts', template: this.accountCountTemplate },
      { key: 'percentage', label: '% of Total Accounts', template: this.percentAccountsTemplate }
    ];
    this.loadAccounts();
    this.loadDistribution();
  }

  loadAccounts() {
    if (this.accounts.length > 0) {
      this.isReloadingAccounts = true;
    } else {
      this.loadingAccounts = true;
    }
    this.apiService.get<AccountBalancesResponse>('getAccountBalances', {
      index: this.accountCurrentPage - 1,
      size: PAGE_SIZE
    }).subscribe({
      next: (response) => {
        this.accounts = response.balances || [];
        if (response.total) {
          this.totalAccounts = response.total;
        }
        this.loadingAccounts = false;
        this.isReloadingAccounts = false;
        this.updateAccountPagination();
      },
      error: (error) => {
        console.error('Error loading account balances:', error);
        this.loadingAccounts = false;
        this.isReloadingAccounts = false;
      }
    });
  }

  loadDistribution() {
    if (this.distributionRanges.length > 0) {
      this.isReloadingDistribution = true;
    } else {
      this.loadingDistribution = true;
    }
    // getDistributions counts with BETWEEN over at least 3 equal slices, so each range is
    // requested on [min, min + 3k] with min + 3k just below the next range start.
    const requests = RANGES.map(r => {
      const min = r.min * XIN;
      const span = r.max * XIN - 1 - min;
      return this.apiService.get<{ distributions?: DistributionSlice[] }>('getDistributions', {
        minAccountBalance: min,
        maxAccountBalance: min + span - (span % 3),
        slices: 3
      });
    });
    forkJoin(requests).subscribe({
      next: (responses) => {
        this.distributionRanges = responses.map((res, i) => ({
          range: RANGES[i].label,
          accounts: (res.distributions || []).reduce((sum, s) => sum + (s.accountsAmount || 0), 0),
          percentage: 0
        }));
        this.recalculatePercentages();
        this.loadingDistribution = false;
        this.isReloadingDistribution = false;
      },
      error: (error) => {
        console.error('Error loading distribution:', error);
        this.loadingDistribution = false;
        this.isReloadingDistribution = false;
      }
    });
  }

  getRank(index: number): number {
    return (this.accountCurrentPage - 1) * PAGE_SIZE + index + 1;
  }

  supplyPercentage(balanceTQT: string): string {
    const balance = parseFloat(balanceTQT || '0');
    return ((balance / (environment.initialSupply * XIN)) * 100).toFixed(4);
  }

  onAccountPageChange(page: number) {
    if (page < 1) return;
    this.accountCurrentPage = page;
    this.loadAccounts();
  }

  private recalculatePercentages() {
    const total = this.distributionRanges.reduce((sum, r) => sum + r.accounts, 0);
    if (!total) return;
    this.distributionRanges = this.distributionRanges.map(r => ({ ...r, percentage: (r.accounts / total) * 100 }));
  }

  private updateAccountPagination() {
    const totalPages = this.totalAccounts
      ? Math.min(MAX_PAGE_INDEX + 1, Math.ceil(this.totalAccounts / PAGE_SIZE))
      : undefined;
    this.accountPaginationConfig = { currentPage: this.accountCurrentPage, totalPages };
  }
}
