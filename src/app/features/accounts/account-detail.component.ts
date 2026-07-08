import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';

interface Account {
  account: string;
  accountRS: string;
  name?: string;
  description?: string;
  balanceTQT: string;
  unconfirmedBalanceTQT: string;
  forgedBalanceTQT: string;
  publicKey?: string;
}

interface AccountTransaction {
  transaction: string;
  type: number;
  senderRS: string;
  recipientRS: string;
  amountTQT: string;
  feeTQT: string;
  timestamp: number;
}

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TimestampPipe, AmountTQTPipe],
  template: `
    <div class="container mt-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/blocks">Blocks</a></li>
          <li class="breadcrumb-item active">Account</li>
        </ol>
      </nav>

      <div class="row" *ngIf="account">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>Account Details</h4>
            </div>
            <div class="card-body">
              <table class="table table-borderless">
                <tr>
                  <td><strong>Account:</strong></td>
                  <td><code>{{ account.accountRS }}</code></td>
                </tr>
                <tr>
                  <td><strong>Account ID:</strong></td>
                  <td><code>{{ account.account }}</code></td>
                </tr>
                <tr *ngIf="account.name">
                  <td><strong>Name:</strong></td>
                  <td>{{ account.name }}</td>
                </tr>
                <tr *ngIf="account.description">
                  <td><strong>Description:</strong></td>
                  <td>{{ account.description }}</td>
                </tr>
                <tr>
                  <td><strong>Balance:</strong></td>
                  <td><strong>{{ account.balanceTQT | amountTQT }} XIN</strong></td>
                </tr>
                <tr>
                  <td><strong>Unconfirmed Balance:</strong></td>
                  <td>{{ account.unconfirmedBalanceTQT | amountTQT }} XIN</td>
                </tr>
                <tr>
                  <td><strong>Earned Fees:</strong></td>
                  <td>{{ account.forgedBalanceTQT | amountTQT }} XIN</td>
                </tr>
                <tr *ngIf="account.publicKey">
                  <td><strong>Public Key:</strong></td>
                  <td><code>{{ account.publicKey }}</code></td>
                </tr>
              </table>
            </div>
          </div>

          <div class="card mt-4">
            <div class="card-header">
              <h4>Latest Transactions</h4>
            </div>
            <div class="card-body">
              <div *ngIf="transactions.length === 0" class="alert alert-warning">
                No transactions found.
              </div>
              <div *ngIf="transactions.length > 0" class="table-responsive">
                <table class="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Amount</th>
                      <th>Fee</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let tx of transactions">
                      <td><a [routerLink]="['/transaction', tx.transaction]">{{ tx.transaction | slice:0:10 }}...</a></td>
                      <td><a [routerLink]="['/account', tx.senderRS]">{{ tx.senderRS }}</a></td>
                      <td>
                        <a *ngIf="tx.recipientRS" [routerLink]="['/account', tx.recipientRS]">{{ tx.recipientRS }}</a>
                        <span *ngIf="!tx.recipientRS">-</span>
                      </td>
                      <td>{{ (tx.amountTQT || '0') | amountTQT }}</td>
                      <td>{{ (tx.feeTQT || '0') | amountTQT }}</td>
                      <td>{{ tx.timestamp | timestamp }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AccountDetailComponent implements OnInit {
  account: Account | null = null;
  accountId: string = '';
  transactions: AccountTransaction[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.accountId = params['id'];
      this.account = null;
      this.transactions = [];
      this.loadAccount();
      this.loadTransactions();
    });
  }

  private loadAccount() {
    this.apiService.get<any>('getAccount', { account: this.accountId })
      .subscribe({
        next: (data) => { if (data && !data.errorCode) this.account = data; },
        error: (error) => console.error('Error loading account:', error)
      });
  }

  private loadTransactions() {
    this.apiService.get<any>('getBlockchainTransactions', { account: this.accountId, firstIndex: 0, lastIndex: 14 })
      .subscribe({
        next: (data) => { if (data && !data.errorCode) this.transactions = data.transactions || []; },
        error: (error) => console.error('Error loading account transactions:', error)
      });
  }
}
