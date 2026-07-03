import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

/** Fields we care about from the node's getConstants response. */
interface NodeConstants {
  epochBeginning?: number;   // milliseconds since Unix epoch
  genesisAccountId?: string; // numeric account id
}

/**
 * Network constants sourced from the connected node at runtime (getConstants),
 * so ONE build is correct for whatever network it is pointed at (mainnet/testnet/…)
 * instead of hard-coding per-network values into environment.*.ts. The build-time
 * environment values are used only as a fallback if getConstants fails.
 */
@Injectable({ providedIn: 'root' })
export class ConstantsService {
  /** Block-timestamp epoch, in SECONDS (node reports epochBeginning in ms). */
  epoch: number = environment.epoch;
  /** Genesis account (numeric id is accepted by the account APIs). */
  genesisAccount: string = environment.genesisAccount;

  constructor(private api: ApiService) {}

  /** Fetch getConstants once at app startup (wired via APP_INITIALIZER). */
  async load(): Promise<void> {
    try {
      const c = await firstValueFrom(this.api.get<NodeConstants>('getConstants'));
      if (c?.epochBeginning != null) {
        this.epoch = Math.floor(c.epochBeginning / 1000); // ms -> s
      }
      if (c?.genesisAccountId) {
        this.genesisAccount = c.genesisAccountId;
      }
    } catch (e) {
      console.warn('ConstantsService: getConstants failed — using build-time fallbacks', e);
    }
  }
}
