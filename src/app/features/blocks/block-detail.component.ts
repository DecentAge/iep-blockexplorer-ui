import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';
import { transactionTypeName } from '../transactions/transactions.component';
import { ModalService } from '../../shared/services/modal.service';

interface BlockTransaction {
  transaction: string;
  fullHash: string;
  type: number;
  subtype: number;
  timestamp: number;
  amountTQT: string;
  feeTQT: string;
  confirmations: number;
  senderRS?: string;
  senderId?: string;
  recipientRS?: string;
  recipientId?: string;
}

interface BlockDetail {
  block: string;
  height: number;
  timestamp: number;
  numberOfTransactions: number;
  totalAmountTQT: string;
  totalFeeTQT: string;
  generator: string;
  generatorRS: string;
  generatorPublicKey: string;
  payloadLength: number;
  version: number;
  baseTarget: string;
  previousBlock?: string;
  transactions?: BlockTransaction[];
}

@Component({
  selector: 'app-block-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TimestampPipe, AmountTQTPipe],
  template: `
    <div class="container mt-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a routerLink="/blocks">Blocks</a></li>
          <li class="breadcrumb-item active">Block {{ blockId | slice:0:8 }}...</li>
        </ol>
      </nav>

      <div class="row" *ngIf="block">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>Block Details</h4>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <table class="table table-borderless">
                    <tr>
                      <td><strong>Block ID:</strong></td>
                      <td><code>{{ block.block }}</code></td>
                    </tr>
                    <tr>
                      <td><strong>Height:</strong></td>
                      <td>{{ block.height | number }}</td>
                    </tr>
                    <tr>
                      <td><strong>Timestamp:</strong></td>
                      <td>{{ block.timestamp | timestamp }}</td>
                    </tr>
                    <tr>
                      <td><strong>Transactions:</strong></td>
                      <td>{{ block.numberOfTransactions | number }}</td>
                    </tr>
                    <tr>
                      <td><strong>Total Amount:</strong></td>
                      <td>{{ (block.totalAmountTQT || '0') | amountTQT }}</td>
                    </tr>
                  </table>
                </div>
                <div class="col-md-6">
                  <table class="table table-borderless">
                    <tr>
                      <td><strong>Total Fee:</strong></td>
                      <td>{{ (block.totalFeeTQT || '0') | amountTQT }}</td>
                    </tr>
                    <tr>
                      <td><strong>Generator:</strong></td>
                      <td>
                        <a style="cursor:pointer" (click)="modal.open('account', block.generatorRS || block.generator)">
                          {{ block.generatorRS || block.generator }}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td><strong>Version:</strong></td>
                      <td>{{ block.version }}</td>
                    </tr>
                    <tr>
                      <td><strong>Payload Length:</strong></td>
                      <td>{{ block.payloadLength | number }} bytes</td>
                    </tr>
                    <tr>
                      <td><strong>Base Target:</strong></td>
                      <td>{{ block.baseTarget }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="card mt-4">
            <div class="card-header">
              <h4>Transactions</h4>
            </div>
            <div class="card-body">
              <div class="table-responsive" *ngIf="block.transactions && block.transactions.length; else noTransactions">
                <table class="table table-striped table-bordered">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Type</th>
                      <th>Timestamp</th>
                      <th>Amount</th>
                      <th>Fee</th>
                      <th>Confirmations</th>
                      <th>Sender</th>
                      <th>Recipient</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let tx of block.transactions">
                      <td>
                        <a class="hash-link" style="cursor:pointer" (click)="modal.open('transaction', tx.transaction)">
                          {{ tx.fullHash | slice:0:10 }}...{{ tx.fullHash | slice:-8 }}
                        </a>
                      </td>
                      <td><span class="badge-type">{{ getTransactionTypeText(tx.type, tx.subtype) }}</span></td>
                      <td>{{ tx.timestamp | timestamp }}</td>
                      <td>{{ (tx.amountTQT || '0') | amountTQT }} XIN</td>
                      <td>{{ (tx.feeTQT || '0') | amountTQT }} XIN</td>
                      <td>{{ tx.confirmations | number }}</td>
                      <td>
                        <a style="cursor:pointer" (click)="modal.open('account', tx.senderRS || tx.senderId)">{{ tx.senderRS || tx.senderId }}</a>
                      </td>
                      <td>
                        <a *ngIf="tx.recipientRS || tx.recipientId; else noRecipient"
                           style="cursor:pointer" (click)="modal.open('account', tx.recipientRS || tx.recipientId)">
                          {{ tx.recipientRS || tx.recipientId }}
                        </a>
                        <ng-template #noRecipient><span class="text-muted">-</span></ng-template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noTransactions>
                <p class="text-muted mb-0">No transactions in this block.</p>
              </ng-template>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!block" class="text-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./block-detail.component.scss']
})
export class BlockDetailComponent implements OnInit {
  @Input() blockId: string = '';
  block: BlockDetail | null = null;

  getTransactionTypeText = transactionTypeName;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    public modal: ModalService
  ) {}

  ngOnInit() {
    if (this.blockId) {
      this.loadBlock();
    } else {
      this.route.params.subscribe(params => {
        this.blockId = params['id'];
        this.loadBlock();
      });
    }
  }

  private loadBlock() {
    this.apiService.get<BlockDetail>('getBlock', { block: this.blockId, includeTransactions: true })
      .subscribe({
        next: (data) => this.block = data,
        error: (error) => console.error('Error loading block:', error)
      });
  }
}
