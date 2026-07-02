import { Pipe, PipeTransform } from '@angular/core';
import { ConstantsService } from '../../core/services/constants.service';
@Pipe({
  name: 'timestamp',
  standalone: true
})
export class TimestampPipe implements PipeTransform {
  constructor(private constants: ConstantsService) {}
  transform(value: number, format?: string): string {
    try {
      const d = new Date((value + this.constants.epoch) * 1000);
      const pad = (n: number) => String(n).padStart(2, '0');
      // Default format: d.M.yyyy HH:mm:ss (matching production)
      return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch (e) {
      return value?.toString() || '';
    }
  }
}
