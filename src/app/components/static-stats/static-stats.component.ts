import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';
interface NetworkStats {
  numberOfBlocks?: number;
  numberOfTransactions?: number;
  totalAmountNQT?: number;
  totalFeeNQT?: number;
  numberOfAccounts?: number;
}
interface BalanceResponse {
  balanceTQT?: string;
}
@Component({
  selector: 'app-static-stats',
  standalone: true,
  imports: [CommonModule],
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
            <p class="box-heading">{{ formatSupply(circulatingSupply) }} <small>XIN</small></p>
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
              {{ getTxPerBlock() }} txs / block
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
            <p class="box-heading">{{ formatNumber(stats?.numberOfAccounts || 0) }}</p>
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
  circulatingSupply: number = environment.initialSupply;
  constructor(private apiService: ApiService) {}
  ngOnInit() {
    this.loadStats();
    this.loadCirculatingSupply();
    setInterval(() => {
      this.loadStats();
      this.loadCirculatingSupply();
    }, 30000);
  }
  private loadStats() {
    this.apiService.get<NetworkStats>('getStatistics').subscribe({
      next: (data) => this.stats = data,
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }
  private loadCirculatingSupply() {
    this.apiService.get<BalanceResponse>('getBalance', {
      account: environment.genesisAccount
    }).subscribe({
      next: (data) => {
        if (data.balanceTQT) {
          const balanceTKN = (parseFloat(data.balanceTQT) / environment.tokenQuants) * -1;
          this.circulatingSupply = balanceTKN || environment.initialSupply;
        }
      },
      error: (error) => {
        console.error('Error loading balance:', error);
      }
    });
  }
  formatSupply(value: number): string {
    return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }
  getTxPerBlock(): string {
    if (!this.stats || !this.stats.numberOfBlocks) {
      return '0.00';
    }
    const txPerBlock = (this.stats.numberOfTransactions || 0) / this.stats.numberOfBlocks;
    return txPerBlock.toFixed(2);
  }
}
