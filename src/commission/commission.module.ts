import { Module } from '@nestjs/common';
import { CalculateCommissionUseCase } from './application/calculate-commission.usecase';
import { CommissionController } from './application/rest/commission.controller';
import { RATES_API, TRANSACTION_CLIENT_REPOSITORY } from './injection-tokens';
import { InMemoryClientRepository } from './application/transaction-client/in-memory-client-repository';
import { InMemoryRatesExchangeApiService } from './application/rates-exchange/in-memory-rates-exchange-api.service';
import { CommissionCalculator } from './domain/calculator/commission-calculator';
import { HighTurnoverPolicy } from './domain/calculator/policies/discounts/high-turnover.policy';
import { VIPPolicy } from './domain/calculator/policies/discounts/vip.policy';
import { CommissionPolicy } from './domain/calculator/policies/discounts/commission-policy';
import { DEFAULT_POLICY } from './domain/calculator/policies/default.policy';

@Module({
  controllers: [CommissionController],
  providers: [
    {
      provide: CommissionCalculator,
      useFactory: (
        highTurnoverPolicy: CommissionPolicy,
        vipPolicy: CommissionPolicy,
      ) => {
        return new CommissionCalculator(DEFAULT_POLICY, [
          highTurnoverPolicy,
          vipPolicy,
        ]);
      },
      inject: [HighTurnoverPolicy, VIPPolicy],
    },
    CalculateCommissionUseCase,
    {
      provide: RATES_API,
      useClass: InMemoryRatesExchangeApiService,
    },
    {
      provide: TRANSACTION_CLIENT_REPOSITORY,
      useClass: InMemoryClientRepository,
    },
    HighTurnoverPolicy,
    VIPPolicy,
  ],
})
export class CommissionModule {}
