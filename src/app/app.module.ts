import { NgModule } from '@angular/core';
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

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
