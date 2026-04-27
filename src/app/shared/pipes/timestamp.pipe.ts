import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'timestamp',
  standalone: true
})
export class TimestampPipe implements PipeTransform {
  transform(value: number): string {
    try {
      const d = new Date((value + environment.epoch) * 1000);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
           + `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch (e) {
      return value?.toString() || '';
    }
  }
}
