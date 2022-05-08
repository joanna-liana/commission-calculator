import { Inject, Injectable } from '@nestjs/common';
import { IRatesExchangeAPI } from 'src/commission/application/rates-exchange/rates-exchange-api.interface';
import { CommissionCalculator } from '../domain/calculator/commission-calculator';
import { ITransactionClientFactory } from '../domain/transaction-client/transaction-client-factory.interface';
import { ITransactionClient } from '../domain/transaction-client/ITransactionClient';
import { Money } from '../domain/money/Money';
import { TRANSACTION_CLIENT_FACTORY, RATES_API } from '../injection-tokens';
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
    @Inject(TRANSACTION_CLIENT_FACTORY)
    private clientFactory: ITransactionClientFactory,
    private calculator: CommissionCalculator,
  ) {}

  async execute({ money, clientId, date }: ICalculateCommissionParams) {
    const rate: number =
      money.currency === 'EUR'
        ? 1
        : await this.ratesExchangeAPI.getEuroRateFor(money, date);

    const client: ITransactionClient = await this.clientFactory.get(clientId);

    return this.calculator.getCommission(Euro.of(money.amount * rate), client);
  }
}
