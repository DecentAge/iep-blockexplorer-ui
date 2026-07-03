import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { StaticStatsComponent } from './components/static-stats/static-stats.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, StaticStatsComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <div class="content-wrapper">
        <app-static-stats></app-static-stats>
        <router-outlet></router-outlet>
      </div>
      <app-footer></app-footer>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Infinity Block Explorer';
}
