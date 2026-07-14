import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { getNetworkEnvironment } from '../../core/network-environment';
import { ModalService, DetailKind } from '../../shared/services/modal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
      <div class="navbar-inner">
        <div class="container-fluid">
          <div class="header-wrapper">
            <div class="navbar-header">
              <button type="button"
                      class="navbar-toggle"
                      (click)="isCollapsed = !isCollapsed">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
              <a routerLink="/" class="navbar-brand">
                <img src="assets/iep-logo.png" alt="Infinity Economics" class="logo-img">
              </a>
            </div>

            <div class="collapse navbar-collapse"
                 [class.in]="!isCollapsed"
                 id="myNavbar">
              <ul class="nav navbar-nav pull-right">
                <li routerLinkActive="active">
                  <a routerLink="/blocks" class="navbar-link">
                    <span class="menu-text">Blocks</span>
                  </a>
                </li>
                <li routerLinkActive="active">
                  <a routerLink="/transactions" class="navbar-link">
                    <span class="menu-text">Transactions</span>
                  </a>
                </li>
                <li routerLinkActive="active">
                  <a routerLink="/unconfirmedTransactions" class="navbar-link">
                    <span class="menu-text">Unconfirmed</span>
                  </a>
                </li>
                <li routerLinkActive="active">
                  <a routerLink="/assets" class="navbar-link">
                    <span class="menu-text">Assets</span>
                  </a>
                </li>
                <li routerLinkActive="active">
                  <a routerLink="/currencies" class="navbar-link">
                    <span class="menu-text">Currencies</span>
                  </a>
                </li>
                <li routerLinkActive="active">
                  <a routerLink="/polls" class="navbar-link">
                    <span class="menu-text">Voting</span>
                  </a>
                </li>
                <li routerLinkActive="active">
                  <a routerLink="/distributions" class="navbar-link">
                    <span class="menu-text">Distribution</span>
                  </a>
                </li>
                <li routerLinkActive="active">
                  <a routerLink="/stats" class="navbar-link">
                    <span class="menu-text">Statistics</span>
                  </a>
                </li>
                <li>
                  <a href="/peerexplorer" class="navbar-link">
                    <span class="menu-text">Peer Explorer</span>
                  </a>
                </li>
                <li class="search-and-type">
                  <form class="navbar-form" (ngSubmit)="search()">
                    <div class="input-group">
                      <input type="text"
                             class="form-control"
                             placeholder="Height / Block ID / Transaction / Account"
                             name="search"
                             *ngIf="showSearchBar"
                             [(ngModel)]="searchTerm">
                      <button class="btn btn-infinity"
                              [class.btn-infinity-enabled]="showSearchBar"
                              type="submit"
                              (click)="!showSearchBar ? showSearchBar = !showSearchBar : search()">
                        <i class="fa fa-search" aria-hidden="true"></i>
                      </button>
                    </div>
                  </form>
                  <span class="network-label">{{ networkName }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./navbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NavbarComponent {
  isCollapsed = true;
  searchTerm = '';
  showSearchBar = false;
  networkName = getNetworkEnvironment().toUpperCase();

  constructor(private router: Router, private api: ApiService, public modal: ModalService) {}

  private goto(kind: DetailKind, id: string) {
    this.modal.open(kind, id);
    this.searchTerm = '';
    this.showSearchBar = false;
  }

  search() {
    const term = this.searchTerm.trim();
    if (!term) return;

    if (term.toUpperCase().startsWith('XIN-')) {
      this.api.get<any>('getAccount', { account: term }).subscribe({
        next: res => res && !res.errorCode
          ? this.goto('account', term)
          : this.notFound(term),
        error: () => this.notFound(term)
      });
    } else if (/^\d+$/.test(term)) {
      this.searchNumeric(term);
    } else {
      this.api.get<any>('getTransaction', { fullHash: term }).subscribe({
        next: res => res && !res.errorCode
          ? this.goto('transaction', res.transaction)
          : this.notFound(term),
        error: () => this.notFound(term)
      });
    }
  }

  private searchNumeric(term: string) {
    this.api.get<any>('getBlock', { block: term }).subscribe({
      next: block => {
        if (block && !block.errorCode) {
          this.goto('block', block.block);
          return;
        }
        this.api.get<any>('getBlock', { height: term }).subscribe({
          next: byHeight => {
            if (byHeight && !byHeight.errorCode) {
              this.goto('block', byHeight.block);
              return;
            }
            this.api.get<any>('getTransaction', { transaction: term }).subscribe({
              next: tx => tx && !tx.errorCode
                ? this.goto('transaction', term)
                : this.notFound(term),
              error: () => this.notFound(term)
            });
          },
          error: () => this.notFound(term)
        });
      },
      error: () => this.notFound(term)
    });
  }

  private notFound(term: string) {
    window.alert(`No account, block or transaction found for "${term}".`);
  }
}
