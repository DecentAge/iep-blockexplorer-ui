import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
              <ul class="nav navbar-nav navbar-right">
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
                  <a href="#" class="navbar-link" (click)="handleLinkClick($event)">
                    <span class="menu-text">Statistics</span>
                  </a>
                </li>
                <li class="search-and-type">
                  <form class="navbar-form navbar-right" (ngSubmit)="search()">
                    <div class="input-group">
                      <input type="text"
                             class="form-control"
                             placeholder="Enter IP address"
                             name="search"
                             [class.ng-hide]="!showSearchBar"
                             [(ngModel)]="searchTerm">
                      <button class="btn btn-infinity"
                              [class.btn-infinity-enabled]="showSearchBar"
                              type="submit"
                              (click)="!showSearchBar ? showSearchBar = !showSearchBar : search()">
                        <i class="fa fa-search" aria-hidden="true"></i>
                      </button>
                    </div>
                  </form>
                  <span class="btn btn-infinity btn-md navbar-btn"
                        type="label">
                    Mainnet
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isCollapsed = true;
  searchTerm = '';
  showSearchBar = false;

  handleLinkClick(event: Event) {
    event.preventDefault();
    // Add functionality for these links later
  }

  search() {
    if (this.searchTerm.trim()) {
      console.log('Search for:', this.searchTerm);
      // Add search functionality here
    }
  }
}
