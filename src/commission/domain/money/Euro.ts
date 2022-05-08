import { Currency } from './Currency';
import { Money } from './Money';

export class Euro extends Money {
  static of(value: string | number): Money {
    return Money.of(value, Currency.EUR);
  }
}
