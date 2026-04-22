import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AmountTQTPipe } from '../../shared/pipes/amount-tqt.pipe';

interface NetworkStats {
  numberOfBlocks?: number;
  numberOfTransactions?: number;
  totalAmountNQT?: number;
  totalFeeNQT?: number;
  numberOfAccounts?: number;
}

@Component({
  selector: 'app-static-stats',
  standalone: true,
  imports: [CommonModule, AmountTQTPipe],
  template: `
    <div class="col-md-12 static-stats-wrapper">
      <div class="row text-center block-blocks" style="margin:0 -5px 0 -5px;">
        <div class="col-lg-2 col-md-4 col-sm-4 block-explorer">
          <div class="panel panel-default">
            <div class="panel-heading">
              <div class="stats-icon">
                <i class="bi bi-clock-history"></i>
              </div>
              <p>Block Time</p>
            </div>
            <p class="box-heading">avg. 60s</p>
          </div>
        </div>

        <div class="col-lg-2 col-md-4 col-sm-4 block-explorer">
          <div class="panel panel-default">
            <div class="panel-heading">
              <div class="stats-icon">
                <i class="bi bi-cash-coin"></i>
              </div>
              <p>Supply Circulating</p>
            </div>
            <p class="box-heading">~9.2B <small>XIN</small></p>
          </div>
        </div>

        <div class="col-lg-2 col-md-4 col-sm-4 block-explorer">
          <div class="panel panel-default">
            <div class="panel-heading">
              <div class="stats-icon">
                <i class="bi bi-arrow-left-right"></i>
              </div>
              <p>Transactions</p>
            </div>
            <p class="box-heading">
              {{ stats ? ((stats.numberOfTransactions || 0) / (stats.numberOfBlocks || 1) | number:'1.1-1') : '~0.5' }} txs / block
            </p>
          </div>
        </div>

        <div class="col-lg-2 col-md-4 col-sm-4 block-explorer">
          <div class="panel panel-default">
            <div class="panel-heading">
              <div class="stats-icon">
                <i class="bi bi-people"></i>
              </div>
              <p>Accounts</p>
            </div>
            <p class="box-heading">{{ (stats?.numberOfAccounts || 45000) | number }}</p>
          </div>
        </div>

        <div class="col-lg-2 col-md-4 col-sm-4 block-explorer">
          <div class="panel panel-default">
            <div class="panel-heading">
              <div class="stats-icon">
                <i class="bi bi-hdd-network"></i>
              </div>
              <p>Nodes</p>
            </div>
            <p class="box-heading">
              <a href="/peerexplorer" target="_blank" class="btn btn-infinity btn-xs"
                 style="color: #474747; line-height:0; text-decoration: none;">
                Peer Explorer
              </a>
            </p>
          </div>
        </div>

        <div class="col-lg-2 col-md-4 col-sm-4 block-explorer">
          <div class="panel panel-default">
            <div class="panel-heading">
              <div class="stats-icon">
                <i class="bi bi-shield-check"></i>
              </div>
              <p>Base Algo</p>
            </div>
            <p class="box-heading">PoS</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./static-stats.component.scss']
})
export class StaticStatsComponent implements OnInit {
  stats: NetworkStats | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadStats();
    // Auto-refresh every 30 seconds
    setInterval(() => this.loadStats(), 30000);
  }

  private loadStats() {
    this.apiService.get<NetworkStats>('', {requestType: 'getStatistics'}).subscribe({
      next: (data) => this.stats = data,
      error: (error) => {
        console.error('Error loading stats:', error);
        // Keep trying to load stats even if there's an error
      }
    });
  }
}
