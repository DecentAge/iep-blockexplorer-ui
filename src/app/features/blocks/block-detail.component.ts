import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';

interface BlockDetail {
  block: string;
  height: number;
  timestamp: number;
  numberOfTransactions: number;
  totalAmountNQT: number;
  totalFeeNQT: number;
  generator: string;
  generatorPublicKey: string;
  payloadLength: number;
  version: number;
  baseTarget: string;
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
                      <td>{{ block.totalAmountNQT | amountTQT }}</td>
                    </tr>
                  </table>
                </div>
                <div class="col-md-6">
                  <table class="table table-borderless">
                    <tr>
                      <td><strong>Total Fee:</strong></td>
                      <td>{{ block.totalFeeNQT | amountTQT }}</td>
                    </tr>
                    <tr>
                      <td><strong>Generator:</strong></td>
                      <td><code>{{ block.generator }}</code></td>
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
  block: BlockDetail | null = null;
  blockId: string = '';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.blockId = params['id'];
      this.loadBlock();
    });
  }

  private loadBlock() {
    this.apiService.get<BlockDetail>('getBlock', { block: this.blockId })
      .subscribe({
        next: (data) => this.block = data,
        error: (error) => console.error('Error loading block:', error)
      });
  }
}
