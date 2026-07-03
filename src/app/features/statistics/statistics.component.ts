import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="main-content">
      <div class="container-fluid">
        <div class="page-header">
          <h1><i class="fas fa-chart-bar me-2"></i>Statistics</h1>
          <p class="lead">Network statistics and analytics</p>
        </div>

        <div class="content-wrapper">
          <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            This section will display comprehensive network statistics and charts.
          </div>

          <!-- Responsive table wrapper -->
          <div class="table-responsive">
            <div class="data-table-container">
              <table class="table table-striped table-hover">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th class="d-none d-md-table-cell">Type</th>
                    <th>Value</th>
                    <th class="d-none d-lg-table-cell">Description</th>
                    <th class="d-none d-sm-table-cell">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Network Height</strong></td>
                    <td class="d-none d-md-table-cell"><span class="badge bg-primary">Block</span></td>
                    <td>1,234,567</td>
                    <td class="d-none d-lg-table-cell">Current blockchain height</td>
                    <td class="d-none d-sm-table-cell">2 min ago</td>
                  </tr>
                  <tr>
                    <td><strong>Total Supply</strong></td>
                    <td class="d-none d-md-table-cell"><span class="badge bg-success">Currency</span></td>
                    <td>999,999,999 XIN</td>
                    <td class="d-none d-lg-table-cell">Total coins in circulation</td>
                    <td class="d-none d-sm-table-cell">1 min ago</td>
                  </tr>
                  <tr>
                    <td><strong>Active Nodes</strong></td>
                    <td class="d-none d-md-table-cell"><span class="badge bg-info">Network</span></td>
                    <td>156</td>
                    <td class="d-none d-lg-table-cell">Number of active network nodes</td>
                    <td class="d-none d-sm-table-cell">3 min ago</td>
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
    .page-header {
      background: #f8f9fa;
      padding: 2rem 0;
      margin-bottom: 2rem;
      border-bottom: 1px solid #dee2e6;
    }
    .content-wrapper {
      padding: 0 15px;
    }

    /* Responsive table styling */
    .table-responsive {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin: 0 -15px;
    }

    .data-table-container {
      min-width: 100%;
      padding: 0 15px;
    }

    .table {
      margin-bottom: 0;
      min-width: 600px;

      th {
        background-color: #f8f9fa;
        font-weight: 600;
        color: #495057;
        border-top: none;
        white-space: nowrap;
      }

      td {
        vertical-align: middle;
        border-top: 1px solid #dee2e6;
      }
    }

    /* Mobile optimizations */
    @media (max-width: 575px) {
      .content-wrapper {
        padding: 0;
      }

      .table-responsive {
        margin: 0 -15px;
        border: none;
        border-radius: 0;
      }

      .data-table-container {
        padding: 0 10px;
      }

      .table {
        font-size: 0.875rem;
        min-width: 400px;

        th, td {
          padding: 0.5rem 0.25rem;
        }
      }

      .badge {
        font-size: 0.7rem;
      }
    }

    /* Tablet optimizations */
    @media (min-width: 576px) and (max-width: 991px) {
      .table {
        font-size: 0.9rem;
      }
    }

    /* Desktop optimizations */
    @media (min-width: 992px) {
      .table-responsive {
        overflow-x: visible;
        margin: 0;
      }

      .data-table-container {
        padding: 0;
      }

      .table {
        min-width: auto;
      }
    }

    /* Badge styling */
    .badge {
      font-size: 0.75rem;
      padding: 0.375rem 0.75rem;
    }

    /* Alert styling */
    .alert-info {
      background-color: rgba(13, 202, 240, 0.1);
      border-color: rgba(13, 202, 240, 0.2);
      color: #055160;
      margin-bottom: 1.5rem;
    }
  `]
})
export class StatisticsComponent {}
