import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'amountTQT',
  standalone: true
})
export class AmountTQTPipe implements PipeTransform {
  transform(value: number | undefined): string {
    if (value === undefined || value === null) {
      return '0.00';
    }
    const amount = value / environment.tokenQuants;
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2 });
  }
}
