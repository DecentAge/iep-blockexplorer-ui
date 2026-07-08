import { Routes } from '@angular/router';
import { BlocksComponent } from './features/blocks/blocks.component';
import { BlockDetailComponent } from './features/blocks/block-detail.component';
import { TransactionsComponent } from './features/transactions/transactions.component';
import { TransactionDetailComponent } from './features/transactions/transaction-detail.component';
import { UnconfirmedComponent } from './features/unconfirmed/unconfirmed.component';
import { AssetsComponent } from './features/assets/assets.component';
import { CurrenciesComponent } from './features/currencies/currencies.component';
import { VotingComponent } from './features/voting/voting.component';
import { DistributionComponent } from './features/distribution/distribution.component';
import { AccountDetailComponent } from './features/accounts/account-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/blocks', pathMatch: 'full' },
  { path: 'blocks', component: BlocksComponent },
  { path: 'block/:id', component: BlockDetailComponent },
  { path: 'transactions', component: TransactionsComponent },
  { path: 'transaction/:id', component: TransactionDetailComponent },
  { path: 'account/:id', component: AccountDetailComponent },
  { path: 'unconfirmedTransactions', component: UnconfirmedComponent },
  { path: 'assets', component: AssetsComponent },
  { path: 'currencies', component: CurrenciesComponent },
  { path: 'polls', component: VotingComponent },
  { path: 'distributions', component: DistributionComponent },
  { path: '**', redirectTo: '/blocks' }
];
