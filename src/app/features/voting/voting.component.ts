import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DataTableComponent, TableColumn, PaginationConfig } from '../../shared/components/data-table/data-table.component';
import { TimestampPipe } from '../../shared/pipes/timestamp.pipe';

interface Poll {
  poll: string;
  name: string;
  description?: string;
  accountRS?: string;
  account: string;
  finishHeight: number;
  votingModel: number;
  minNumberOfOptions: number;
  maxNumberOfOptions: number;
  minRangeValue: number;
  maxRangeValue: number;
  timestamp: number;
  finished?: boolean;
}

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [CommonModule, RouterModule, DataTableComponent, TimestampPipe],
  template: `
    <div class="main-content">
      <div class="col-md-12">
        <app-data-table
          [title]="'Polls'"
          [data]="polls"
          [columns]="columns"
          [loading]="loading"
          [isReloading]="isReloading"
          [pagination]="paginationConfig"
          [emptyMessage]="'No polls found.'"
          (reload)="loadPolls()"
          (pageChange)="onPageChange($event)">
        </app-data-table>

        <ng-template #pollTemplate let-row>
          <span class="hash-link">{{ row.poll }}</span>
        </ng-template>

        <ng-template #nameTemplate let-row>
          <strong>{{ row.name }}</strong>
        </ng-template>

        <ng-template #creatorTemplate let-row>
          <span class="hash-link small">
            {{ row.accountRS || (row.account | slice:0:8) + '...' + (row.account | slice:-6) }}
          </span>
        </ng-template>

        <ng-template #votingModelTemplate let-row>
          <span class="badge badge-info">{{ getVotingModelText(row.votingModel) }}</span>
        </ng-template>

        <ng-template #finishHeightTemplate let-row>
          <span>{{ row.finishHeight }}</span>
        </ng-template>

        <ng-template #statusTemplate let-row>
          <span [class]="row.finished ? 'badge badge-secondary' : 'badge badge-success'">
            {{ row.finished ? 'Finished' : 'Active' }}
          </span>
        </ng-template>

        <ng-template #timestampTemplate let-row>
          <span class="timestamp">{{ row.timestamp | timestamp }}</span>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .main-content {
      padding: 2rem 0;
    }
    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
    }
    .badge-info {
      background-color: #17a2b8;
      color: white;
    }
    .badge-success {
      background-color: #28a745;
      color: white;
    }
    .badge-secondary {
      background-color: #6c757d;
      color: white;
    }
  `]
})
export class VotingComponent implements OnInit {
  @ViewChild('pollTemplate', { static: true }) pollTemplate!: TemplateRef<any>;
  @ViewChild('nameTemplate', { static: true }) nameTemplate!: TemplateRef<any>;
  @ViewChild('creatorTemplate', { static: true }) creatorTemplate!: TemplateRef<any>;
  @ViewChild('votingModelTemplate', { static: true }) votingModelTemplate!: TemplateRef<any>;
  @ViewChild('finishHeightTemplate', { static: true }) finishHeightTemplate!: TemplateRef<any>;
  @ViewChild('statusTemplate', { static: true }) statusTemplate!: TemplateRef<any>;
  @ViewChild('timestampTemplate', { static: true }) timestampTemplate!: TemplateRef<any>;

  polls: Poll[] = [];
  columns: TableColumn[] = [];
  loading: boolean = false;
  isReloading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 25;
  paginationConfig?: PaginationConfig;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.setupColumns();
    this.loadPolls();
  }

  setupColumns() {
    this.columns = [
      { key: 'poll', label: 'Poll ID', template: this.pollTemplate },
      { key: 'name', label: 'Name', template: this.nameTemplate },
      { key: 'account', label: 'Creator', template: this.creatorTemplate },
      { key: 'votingModel', label: 'Voting Model', template: this.votingModelTemplate },
      { key: 'finishHeight', label: 'Finish Height', template: this.finishHeightTemplate },
      { key: 'finished', label: 'Status', template: this.statusTemplate },
      { key: 'timestamp', label: 'Created', template: this.timestampTemplate }
    ];
  }

  loadPolls() {
    const wasLoaded = this.polls.length > 0;
    if (wasLoaded) {
      this.isReloading = true;
    } else {
      this.loading = true;
    }

    const firstIndex = (this.currentPage - 1) * this.pageSize;
    const lastIndex = firstIndex + this.pageSize - 1;

    this.apiService.get<{ polls: Poll[] }>('getAllPolls', {
      firstIndex: firstIndex,
      lastIndex: lastIndex
    }).subscribe({
      next: (response) => {
        this.polls = response.polls || [];
        this.loading = false;
        this.isReloading = false;
        this.updatePagination();
      },
      error: (error) => {
        console.error('Error loading polls:', error);
        this.loading = false;
        this.isReloading = false;
      }
    });
  }

  getVotingModelText(model: number): string {
    switch (model) {
      case 0: return 'Account';
      case 1: return 'Balance';
      case 2: return 'Asset';
      case 3: return 'Currency';
      default: return `Model ${model}`;
    }
  }

  updatePagination() {
    this.paginationConfig = {
      currentPage: this.currentPage,
      showPages: this.getPageNumbers()
    };
  }

  getPageNumbers(): number[] {
    const pages = [];
    for (let i = Math.max(1, this.currentPage - 2); i <= this.currentPage + 2; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPageChange(page: number) {
    if (page < 1) return;
    this.currentPage = page;
    this.loadPolls();
  }
}
