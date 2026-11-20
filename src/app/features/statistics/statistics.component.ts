import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { environment } from '../../../environments/environment';

interface StatRow {
  metric: string;
  value: number;
}

const GROUPS: { title: string; fields: [string, string][] }[] = [
  {
    title: 'Blockchain',
    fields: [
      ['numberOfBlocks', 'Blocks'],
      ['numberOfTransactions', 'Transactions'],
      ['numberOfAccounts', 'Accounts'],
      ['numberOfPhasingOnlyAccounts', 'Phasing-only Accounts'],
      ['numberOfAliases', 'Aliases'],
      ['numberOfPolls', 'Polls'],
      ['numberOfVotes', 'Votes'],
      ['numberOfPeers', 'Known Peers'],
      ['numberOfActivePeers', 'Active Peers']
    ]
  },
  {
    title: 'Assets & Currencies',
    fields: [
      ['numberOfAssets', 'Assets'],
      ['numberOfTransfers', 'Asset Transfers'],
      ['numberOfTrades', 'Trades'],
      ['numberOfOrders', 'Total Orders'],
      ['numberOfAskOrders', 'Ask Orders'],
      ['numberOfBidOrders', 'Bid Orders'],
      ['numberOfCurrencies', 'Currencies'],
      ['numberOfCurrencyTransfers', 'Currency Transfers'],
      ['numberOfExchanges', 'Exchanges'],
      ['numberOfExchangeRequests', 'Exchange Requests'],
      ['numberOfOffers', 'Offers']
    ]
  }
];

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="main-content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-lg-6" *ngFor="let group of groups; let i = index">
            <app-data-table
              [title]="group.title"
              [data]="rows[i]"
              [columns]="columns"
              [loading]="loading"
              [isReloading]="isReloading"
              [showReloadButton]="i === 0"
              [emptyMessage]="'No statistics available.'"
              (reload)="load()">
            </app-data-table>
          </div>
        </div>

        <ng-template #metricTemplate let-row>
          <strong>{{ row.metric }}</strong>
        </ng-template>

        <ng-template #valueTemplate let-row>
          <span>{{ row.value | number }}</span>
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
export class StatisticsComponent implements OnInit, OnDestroy {
  @ViewChild('metricTemplate', { static: true }) metricTemplate!: TemplateRef<any>;
  @ViewChild('valueTemplate', { static: true }) valueTemplate!: TemplateRef<any>;

  groups = GROUPS;
  rows: StatRow[][] = GROUPS.map(() => []);
  columns: TableColumn[] = [];
  loading = false;
  isReloading = false;
  private timer?: ReturnType<typeof setInterval>;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.columns = [
      { key: 'metric', label: 'Metric', template: this.metricTemplate },
      { key: 'value', label: 'Value', template: this.valueTemplate }
    ];
    this.load();
    this.timer = setInterval(() => this.load(), environment.autoPageRefreshInterval || 60000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  load() {
    if (this.rows[0].length > 0) {
      this.isReloading = true;
    } else {
      this.loading = true;
    }
    this.apiService.get<Record<string, number>>('getStatistics').subscribe({
      next: (stats) => {
        this.rows = GROUPS.map(g => g.fields.map(([key, metric]) => ({ metric, value: stats[key] ?? 0 })));
        this.loading = false;
        this.isReloading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.loading = false;
        this.isReloading = false;
      }
    });
  }
}
