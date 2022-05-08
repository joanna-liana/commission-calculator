import { Module } from '@nestjs/common';
import { InMemoryTransactionClientFactory } from './application/transaction-client/in-memory-client-factory';
import { CalculateCommissionUseCase } from './application/calculate-commission.usecase';
import { CommissionController } from './application/rest/commission.controller';
import {
  RATES_API,
  TRANSACTION_CLIENT_FACTORY,
  TRANSACTION_CLIENT_REPOSITORY,
} from './injection-tokens';
import { InMemoryClientRepository } from './application/transaction-client/in-memory-client-repository';
import { InMemoryRatesExchangeApiService } from './application/rates-exchange/in-memory-rates-exchange-api.service';
import { CommissionCalculator } from './domain/calculator/commission-calculator';

@Module({
  controllers: [CommissionController],
  providers: [
    CommissionCalculator,
    CalculateCommissionUseCase,
    {
      provide: RATES_API,
      useClass: InMemoryRatesExchangeApiService,
    },
    {
      provide: TRANSACTION_CLIENT_FACTORY,
      useClass: InMemoryTransactionClientFactory,
    },
    {
      provide: TRANSACTION_CLIENT_REPOSITORY,
      useClass: InMemoryClientRepository,
    },
  ],
})
export class CommissionModule {}
