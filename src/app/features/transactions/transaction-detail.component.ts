import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';

interface TransactionDetail {
  transaction: string;
  type: number;
  subtype: number;
  timestamp: number;
  deadline: number;
  amountNQT: number;
  feeNQT: number;
  sender: string;
  recipient?: string;
  confirmations: number;
}

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TimestampPipe, AmountTQTPipe],
  template: `
    <div class="container mt-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/transactions">Transactions</a></li>
          <li class="breadcrumb-item active">{{ transactionId | slice:0:8 }}...</li>
        </ol>
      </nav>

      <div class="row" *ngIf="transaction">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>Transaction Details</h4>
            </div>
            <div class="card-body">
              <table class="table table-borderless">
                <tr>
                  <td><strong>Transaction ID:</strong></td>
                  <td><code>{{ transaction.transaction }}</code></td>
                </tr>
                <tr>
                  <td><strong>Type:</strong></td>
                  <td>{{ transaction.type }}.{{ transaction.subtype }}</td>
                </tr>
                <tr>
                  <td><strong>Amount:</strong></td>
                  <td>{{ transaction.amountNQT | amountTQT }}</td>
                </tr>
                <tr>
                  <td><strong>Fee:</strong></td>
                  <td>{{ transaction.feeNQT | amountTQT }}</td>
                </tr>
                <tr>
                  <td><strong>Sender:</strong></td>
                  <td><code>{{ transaction.sender }}</code></td>
                </tr>
                <tr *ngIf="transaction.recipient">
                  <td><strong>Recipient:</strong></td>
                  <td><code>{{ transaction.recipient }}</code></td>
                </tr>
                <tr>
                  <td><strong>Timestamp:</strong></td>
                  <td>{{ transaction.timestamp | timestamp }}</td>
                </tr>
                <tr>
                  <td><strong>Confirmations:</strong></td>
                  <td>{{ transaction.confirmations | number }}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!transaction" class="text-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./transaction-detail.component.scss']
})
export class TransactionDetailComponent implements OnInit {
  transaction: TransactionDetail | null = null;
  transactionId: string = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.transactionId = params['id'];
      this.loadTransaction();
    });
  }

  private loadTransaction() {
    this.apiService.get<TransactionDetail>('getTransaction', { transaction: this.transactionId })
      .subscribe({
        next: (data) => this.transaction = data,
        error: (error) => console.error('Error loading transaction:', error)
      });
  }
}
