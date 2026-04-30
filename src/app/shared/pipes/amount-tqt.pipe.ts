import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';
@Pipe({
  name: 'amountTQT',
  standalone: true
})
export class AmountTQTPipe implements PipeTransform {
  transform(value: number | string | undefined): string {
    if (value === undefined || value === null) {
      return '0.00';
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) {
      return '0.00';
    }
    const amount = numValue / environment.tokenQuants;
    return amount.toFixed(2);
  }
}
