import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';

@Pipe({
  name: 'timestamp',
  standalone: true
})
export class TimestampPipe implements PipeTransform {
  transform(value: number): string {
    try {
      const actual = value + environment.epoch;
      const momentObj = moment.unix(actual);
      return momentObj.format('YYYY-MM-DDTHH:mm:ss');
    } catch (e) {
      return value?.toString() || '';
    }
  }
}
