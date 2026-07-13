import { Injectable, signal } from '@angular/core';

export type DetailKind = 'block' | 'transaction' | 'account';
export interface DetailRef { kind: DetailKind; id: string; }

@Injectable({ providedIn: 'root' })
export class ModalService {
  readonly current = signal<DetailRef | null>(null);

  open(kind: DetailKind, id: string | number | null | undefined): void {
    if (id !== null && id !== undefined && id !== '') this.current.set({ kind, id: String(id) });
  }

  close(): void {
    this.current.set(null);
  }
}
