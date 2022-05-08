import { Money } from 'src/commission/domain/money/Money';

export interface IRatesExchangeAPI {
  getEuroRateFor(money: Money, date: Date): Promise<number>;
}
