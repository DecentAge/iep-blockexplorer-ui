import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';
import { BlockDetailComponent } from '../../../features/blocks/block-detail.component';
import { TransactionDetailComponent } from '../../../features/transactions/transaction-detail.component';
import { AccountDetailComponent } from '../../../features/accounts/account-detail.component';

@Component({
  selector: 'app-detail-modal',
  standalone: true,
  imports: [CommonModule, BlockDetailComponent, TransactionDetailComponent, AccountDetailComponent],
  template: `
    @if (modal.current(); as ref) {
      <div class="dm-backdrop" (click)="modal.close()">
        <div class="dm-dialog" (click)="$event.stopPropagation()">
          <button type="button" class="dm-close" (click)="modal.close()" aria-label="Close">&times;</button>
          <div class="dm-body">
            @switch (ref.kind) {
              @case ('block') { @for (id of [ref.id]; track id) { <app-block-detail [blockId]="id"></app-block-detail> } }
              @case ('transaction') { @for (id of [ref.id]; track id) { <app-transaction-detail [transactionId]="id"></app-transaction-detail> } }
              @case ('account') { @for (id of [ref.id]; track id) { <app-account-detail [accountId]="id"></app-account-detail> } }
            }
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['./detail-modal.component.scss']
})
export class DetailModalComponent {
  modal = inject(ModalService);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.modal.close();
  }
}
