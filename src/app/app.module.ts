import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { StaticStatsComponent } from './components/static-stats/static-stats.component';
import { BlocksComponent } from './features/blocks/blocks.component';
import { BlockDetailComponent } from './features/blocks/block-detail.component';
import { TransactionsComponent } from './features/transactions/transactions.component';
import { TransactionDetailComponent } from './features/transactions/transaction-detail.component';
import { TimestampPipe } from './shared/pipes/timestamp.pipe';
import { AmountTQTPipe } from './shared/pipes/amount-tqt.pipe';
import { routes } from './app.routes';
import { ConstantsService } from './core/services/constants.service';

@NgModule({
  imports: [
    AppComponent,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    NavbarComponent,
    FooterComponent,
    StaticStatsComponent,
    BlocksComponent,
    BlockDetailComponent,
    TransactionsComponent,
    TransactionDetailComponent,
    TimestampPipe,
    AmountTQTPipe
  ],
  providers: [
    {
      // Load network constants (epoch, genesisAccount) from the connected node's
      // getConstants BEFORE the app renders, so no per-network values are baked in.
      provide: APP_INITIALIZER,
      useFactory: (constants: ConstantsService) => () => constants.load(),
      deps: [ConstantsService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
