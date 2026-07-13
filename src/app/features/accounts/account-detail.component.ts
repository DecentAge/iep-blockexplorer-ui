import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';
import { ModalService } from '../../shared/services/modal.service';

interface AccountInfo {
  account?: string;
  accountRS?: string;
  balanceTQT?: string;
  unconfirmedBalanceTQT?: string;
  forgedBalanceTQT?: string;
  publicKey?: string;
  name?: string;
  description?: string;
}

interface AccountTransaction {
  transaction: string;
  fullHash: string;
  senderRS?: string;
  recipientRS?: string;
  amountTQT: string;
  feeTQT: string;
  type: number;
  subtype: number;
  timestamp: number;
  confirmations: number;
}

interface AccountAsset {
  asset: string;
  name?: string;
  quantityQNT: string;
  decimals?: number;
  numberOfAccounts?: number;
  numberOfTrades?: number;
  numberOfTransfers?: number;
}

interface AccountCurrency {
  currency: string;
  code?: string;
  name?: string;
  units?: string;
  unconfirmedUnits?: string;
  decimals?: number;
  numberOfExchanges?: number;
  numberOfTransfers?: number;
}

interface AccountPoll {
  poll: string;
  name?: string;
  description?: string;
  votingModel?: number;
  options?: string[];
  finished?: boolean;
  finishHeight?: number;
}

type TabKey = 'transactions' | 'assets' | 'currencies' | 'polls';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TimestampPipe, AmountTQTPipe],
  template: `
    <div class="container mt-4 account-detail">
      <div class="card mb-4">
        <div class="card-header">
          <h4 class="mb-0">Account {{ account?.accountRS || accountId }}</h4>
        </div>
        <div class="card-body">
          <table class="table account-info-table">
            <tbody>
              <tr>
                <td class="label-cell">Account</td>
                <td>{{ account?.accountRS || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Account ID</td>
                <td><code>{{ account?.account || '-' }}</code></td>
              </tr>
              <tr *ngIf="account?.name">
                <td class="label-cell">Name</td>
                <td>{{ account?.name }}</td>
              </tr>
              <tr *ngIf="account?.description">
                <td class="label-cell">Description</td>
                <td>{{ account?.description }}</td>
              </tr>
              <tr>
                <td class="label-cell">Balance</td>
                <td><strong>{{ account?.balanceTQT | amountTQT }} XIN</strong></td>
              </tr>
              <tr>
                <td class="label-cell">Unconfirmed</td>
                <td>{{ account?.unconfirmedBalanceTQT | amountTQT }} XIN</td>
              </tr>
              <tr>
                <td class="label-cell">Earned Fees</td>
                <td>{{ account?.forgedBalanceTQT | amountTQT }} XIN</td>
              </tr>
              <tr>
                <td class="label-cell">Public Key</td>
                <td class="break-all"><code>{{ account?.publicKey || '-' }}</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" [class.active]="activeTab === 'transactions'"
             href="javascript:void(0)" (click)="selectTab('transactions')">Transactions</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="activeTab === 'assets'"
             href="javascript:void(0)" (click)="selectTab('assets')">Assets</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="activeTab === 'currencies'"
             href="javascript:void(0)" (click)="selectTab('currencies')">Currencies</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="activeTab === 'polls'"
             href="javascript:void(0)" (click)="selectTab('polls')">Voting / Polls</a>
        </li>
      </ul>

      <div class="tab-panel card border-top-0">
        <div class="card-body">

          <div *ngIf="activeTab === 'transactions'">
            <div *ngIf="txLoading" class="text-muted py-3">Loading...</div>
            <div *ngIf="!txLoading && transactions.length === 0" class="text-muted py-3">No transactions found.</div>
            <div class="table-responsive" *ngIf="!txLoading && transactions.length > 0">
              <table class="table detail-table">
                <thead>
                  <tr>
                    <th>Tx-Hash</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th class="text-end">Amount</th>
                    <th class="text-end">Fee</th>
                    <th class="text-end">Conf.</th>
                    <th>Sender</th>
                    <th>Recipient</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let tx of transactions">
                    <td>
                      <a class="hash-link" style="cursor:pointer" (click)="modal.open('transaction', tx.transaction)">
                        {{ tx.fullHash | slice:0:10 }}...{{ tx.fullHash | slice:-6 }}
                      </a>
                    </td>
                    <td>{{ getTransactionTypeText(tx.type, tx.subtype) }}</td>
                    <td>{{ tx.timestamp | timestamp }}</td>
                    <td class="text-end">{{ tx.amountTQT | amountTQT }}</td>
                    <td class="text-end">{{ tx.feeTQT | amountTQT }}</td>
                    <td class="text-end">{{ tx.confirmations | number }}</td>
                    <td>
                      <a *ngIf="tx.senderRS" class="hash-link" style="cursor:pointer" (click)="modal.open('account', tx.senderRS)">{{ tx.senderRS }}</a>
                      <span *ngIf="!tx.senderRS" class="text-muted">-</span>
                    </td>
                    <td>
                      <a *ngIf="tx.recipientRS" class="hash-link" style="cursor:pointer" (click)="modal.open('account', tx.recipientRS)">{{ tx.recipientRS }}</a>
                      <span *ngIf="!tx.recipientRS" class="text-muted">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2"
                 *ngIf="!txLoading && (txPage > 0 || transactions.length === txPageSize)">
              <button class="btn btn-outline-secondary btn-sm" [disabled]="txPage === 0" (click)="prevTxPage()">Previous</button>
              <span class="text-muted small">Page {{ txPage + 1 }}</span>
              <button class="btn btn-outline-secondary btn-sm" [disabled]="transactions.length < txPageSize" (click)="nextTxPage()">Next</button>
            </div>
          </div>

          <div *ngIf="activeTab === 'assets'">
            <div *ngIf="assetsLoading" class="text-muted py-3">Loading...</div>
            <div *ngIf="!assetsLoading && assets.length === 0" class="text-muted py-3">No assets found.</div>
            <div class="table-responsive" *ngIf="!assetsLoading && assets.length > 0">
              <table class="table detail-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Name</th>
                    <th class="text-end">Quantity</th>
                    <th class="text-end">Trades</th>
                    <th class="text-end">Transfers</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let a of assets">
                    <td><code>{{ a.asset }}</code></td>
                    <td>{{ a.name || '-' }}</td>
                    <td class="text-end">{{ formatQuantity(a.quantityQNT, a.decimals) }}</td>
                    <td class="text-end">{{ a.numberOfTrades ?? 0 | number }}</td>
                    <td class="text-end">{{ a.numberOfTransfers ?? 0 | number }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div *ngIf="activeTab === 'currencies'">
            <div *ngIf="currenciesLoading" class="text-muted py-3">Loading...</div>
            <div *ngIf="!currenciesLoading && currencies.length === 0" class="text-muted py-3">No currencies found.</div>
            <div class="table-responsive" *ngIf="!currenciesLoading && currencies.length > 0">
              <table class="table detail-table">
                <thead>
                  <tr>
                    <th>Currency</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th class="text-end">Units</th>
                    <th class="text-end">Exchanges</th>
                    <th class="text-end">Transfers</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of currencies">
                    <td><code>{{ c.currency }}</code></td>
                    <td>{{ c.code || '-' }}</td>
                    <td>{{ c.name || '-' }}</td>
                    <td class="text-end">{{ formatQuantity(c.units, c.decimals) }}</td>
                    <td class="text-end">{{ c.numberOfExchanges ?? 0 | number }}</td>
                    <td class="text-end">{{ c.numberOfTransfers ?? 0 | number }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div *ngIf="activeTab === 'polls'">
            <div *ngIf="pollsLoading" class="text-muted py-3">Loading...</div>
            <div *ngIf="!pollsLoading && polls.length === 0" class="text-muted py-3">No polls found.</div>
            <div class="table-responsive" *ngIf="!pollsLoading && polls.length > 0">
              <table class="table detail-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Model</th>
                    <th class="text-end">Options</th>
                    <th>Finished</th>
                    <th class="text-end">Height</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let p of polls">
                    <td>{{ p.name || '-' }}</td>
                    <td>{{ getVotingModelText(p.votingModel) }}</td>
                    <td class="text-end">{{ (p.options?.length || 0) | number }}</td>
                    <td>{{ p.finished ? 'Yes' : 'No' }}</td>
                    <td class="text-end">{{ p.finishHeight | number }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .account-detail { max-width: 1100px; }
    .account-info-table td { padding: 0.9rem 1rem; vertical-align: top; }
    .account-info-table .label-cell { width: 200px; font-weight: 600; color: #555; }
    .account-info-table tr + tr td { border-top: 1px solid #eaeaea; }
    .break-all { word-break: break-all; }
    .detail-table th { padding: 0.75rem 1rem; }
    .detail-table td { padding: 0.75rem 1rem; vertical-align: middle; }
    .hash-link { text-decoration: none; }
    .hash-link:hover { text-decoration: underline; }
    .tab-panel { border-top-left-radius: 0; border-top-right-radius: 0; }
  `]
})
export class AccountDetailComponent implements OnInit {
  @Input() accountId?: string;

  account: AccountInfo | null = null;

  activeTab: TabKey = 'transactions';

  transactions: AccountTransaction[] = [];
  txPage = 0;
  txPageSize = 15;
  txLoading = false;
  txLoaded = false;

  assets: AccountAsset[] = [];
  assetsLoading = false;
  assetsLoaded = false;

  currencies: AccountCurrency[] = [];
  currenciesLoading = false;
  currenciesLoaded = false;

  polls: AccountPoll[] = [];
  pollsLoading = false;
  pollsLoaded = false;

  private currentId = '';

  constructor(private route: ActivatedRoute, private apiService: ApiService, public modal: ModalService) {}

  ngOnInit() {
    if (this.accountId) {
      this.init(this.accountId);
    } else {
      this.route.params.subscribe(params => this.init(params['id']));
    }
  }

  private init(id: string) {
    if (!id || id === this.currentId) {
      return;
    }
    this.currentId = id;
    this.resetState();
    this.loadAccount();
    this.loadTransactions();
  }

  private resetState() {
    this.account = null;
    this.activeTab = 'transactions';
    this.transactions = [];
    this.txPage = 0;
    this.txLoaded = false;
    this.assets = [];
    this.assetsLoaded = false;
    this.currencies = [];
    this.currenciesLoaded = false;
    this.polls = [];
    this.pollsLoaded = false;
  }

  private loadAccount() {
    this.apiService.get<AccountInfo>('getAccount', { account: this.currentId }).subscribe({
      next: (data) => this.account = data,
      error: (err) => console.error('Error loading account:', err)
    });
  }

  selectTab(tab: TabKey) {
    this.activeTab = tab;
    if (tab === 'assets' && !this.assetsLoaded) { this.loadAssets(); }
    if (tab === 'currencies' && !this.currenciesLoaded) { this.loadCurrencies(); }
    if (tab === 'polls' && !this.pollsLoaded) { this.loadPolls(); }
  }

  loadTransactions() {
    const firstIndex = this.txPage * this.txPageSize;
    const lastIndex = firstIndex + this.txPageSize - 1;
    this.txLoading = true;
    this.apiService.get<{ transactions: AccountTransaction[] }>('getBlockchainTransactions', {
      account: this.currentId,
      firstIndex,
      lastIndex
    }).subscribe({
      next: (res) => {
        this.transactions = res.transactions || [];
        this.txLoading = false;
        this.txLoaded = true;
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.txLoading = false;
      }
    });
  }

  nextTxPage() {
    if (this.transactions.length < this.txPageSize) { return; }
    this.txPage++;
    this.loadTransactions();
  }

  prevTxPage() {
    if (this.txPage === 0) { return; }
    this.txPage--;
    this.loadTransactions();
  }

  loadAssets() {
    this.assetsLoading = true;
    this.apiService.get<{ accountAssets: AccountAsset[] }>('getAccountAssets', {
      account: this.currentId,
      includeAssetInfo: true
    }).subscribe({
      next: (res) => {
        this.assets = res.accountAssets || [];
        this.assetsLoading = false;
        this.assetsLoaded = true;
      },
      error: (err) => {
        console.error('Error loading assets:', err);
        this.assetsLoading = false;
      }
    });
  }

  loadCurrencies() {
    this.currenciesLoading = true;
    this.apiService.get<{ accountCurrencies: AccountCurrency[] }>('getAccountCurrencies', {
      account: this.currentId,
      includeCurrencyInfo: true
    }).subscribe({
      next: (res) => {
        this.currencies = res.accountCurrencies || [];
        this.currenciesLoading = false;
        this.currenciesLoaded = true;
      },
      error: (err) => {
        console.error('Error loading currencies:', err);
        this.currenciesLoading = false;
      }
    });
  }

  loadPolls() {
    this.pollsLoading = true;
    this.apiService.get<{ polls: AccountPoll[] }>('getPolls', {
      account: this.currentId,
      includeFinished: true
    }).subscribe({
      next: (res) => {
        this.polls = res.polls || [];
        this.pollsLoading = false;
        this.pollsLoaded = true;
      },
      error: (err) => {
        console.error('Error loading polls:', err);
        this.pollsLoading = false;
      }
    });
  }

  formatQuantity(value: string | undefined, decimals?: number): string {
    if (value === undefined || value === null) { return '0'; }
    const num = Number(value);
    if (isNaN(num)) { return '0'; }
    const d = decimals || 0;
    return (num / Math.pow(10, d)).toLocaleString('en-US', { maximumFractionDigits: d });
  }

  getTransactionTypeText(type: number, subtype: number): string {
    if (type === 0 && subtype === 0) { return 'Payment'; }
    if (type === 1) { return 'Message'; }
    if (type === 2) { return 'Asset'; }
    if (type === 3) { return 'Digital Goods'; }
    if (type === 4) { return 'Account Control'; }
    if (type === 5) { return 'Currency'; }
    return `${type}.${subtype}`;
  }

  getVotingModelText(model?: number): string {
    switch (model) {
      case 0: return 'Vote';
      case 1: return 'Account';
      case 2: return 'Asset';
      case 3: return 'Currency';
      case 4: return 'Balance';
      default: return model !== undefined ? String(model) : '-';
    }
  }
}
