import { Inject, Injectable } from '@nestjs/common';
import { IRatesExchangeAPI } from 'src/commission/application/rates-exchange/rates-exchange-api.interface';
import { CommissionCalculator } from '../domain/calculator/commission-calculator';
import { Money } from '../domain/money/Money';
import { RATES_API } from '../injection-tokens';
import { Euro } from '../domain/money/Euro';

export interface ICalculateCommissionParams {
  money: Money;
  date: Date;
  clientId: number;
}

@Injectable()
export class CalculateCommissionUseCase {
  constructor(
    @Inject(RATES_API)
    private ratesExchangeAPI: IRatesExchangeAPI,
    private calculator: CommissionCalculator,
  ) {}

  async execute({ money, clientId, date }: ICalculateCommissionParams) {
    const rate: number =
      money.currency === 'EUR'
        ? 1
        : await this.ratesExchangeAPI.getEuroRateFor(money, date);

    return this.calculator.getCommission({
      money: Euro.of(money.amount * rate),
      clientId,
      date,
    });
  }
}
