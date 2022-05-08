import { Injectable, Optional } from '@nestjs/common';
import { IRatesExchangeAPI } from './rates-exchange-api.interface';

@Injectable()
export class InMemoryRatesExchangeApiService implements IRatesExchangeAPI {
  constructor(@Optional() private readonly defaultRate = 10) {}

  getEuroRateFor(): Promise<number> {
    return Promise.resolve(this.defaultRate);
  }
}
