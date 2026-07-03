import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { environment } from '../../../environments/environment';
interface BlockchainStatus {
  numberOfBlocks?: number;
}
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="col-md-12">
      <footer class="footer">
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-7">
              <span class="footer-brand">
                <strong>Infinity BlockExplorer</strong>
              </span>
              <div class="footer-text">
                This website is owned by the <span class="text-highlight">Infinity community</span> and managed by the <span class="text-highlight">Infinity Foundation</span>.
              </div>
            </div>
            <div class="col-md-5">
              <div class="footer-stats">
                <span class="footer-stat-line">
                  <strong>Date : {{ currentDate }}</strong>
                  <span class="text-highlight"> | </span>
                  <strong>Height : {{ currentHeight }}</strong>
                </span>
                <br>
                <span class="footer-stat-line">
                  Node : {{ connectedURL }}
                  <span class="text-highlight"> | </span>
                  Version : {{ version }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentHeight: number = 0;
  connectedURL: string = environment.apiUrl;
  version: string = environment.version || '';
  currentDate: string = '';
  constructor(private apiService: ApiService) {}
  ngOnInit(): void {
    this.updateDate();
    this.loadBlockchainStatus();
    setInterval(() => {
      this.updateDate();
      this.loadBlockchainStatus();
    }, environment.autoPageRefreshInterval || 60000);
  }
  private updateDate() {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    this.currentDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  private loadBlockchainStatus() {
    this.apiService.get<BlockchainStatus>('getBlockchainStatus').subscribe({
      next: (data) => {
        if (data.numberOfBlocks) {
          this.currentHeight = data.numberOfBlocks;
        }
      },
      error: (error) => {
        console.error('Error loading blockchain status:', error);
      }
    });
  }
}
