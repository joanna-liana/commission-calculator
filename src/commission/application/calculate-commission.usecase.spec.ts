import { Test, TestingModule } from '@nestjs/testing';
import { CommissionCalculator } from '../domain/calculator/commission-calculator';
import {
  CalculateCommissionUseCase,
  ICalculateCommissionParams,
} from './calculate-commission.usecase';
import { InMemoryRatesExchangeApiService } from './rates-exchange/in-memory-rates-exchange-api.service';
import { ITransactionClient } from '../domain/transaction-client/ITransactionClient';
import { Money } from '../domain/money/Money';
import { Currency } from '../domain/money/Currency';
import { sampleClient } from '../../test/fixtures';
import { Euro } from '../domain/money/Euro';
import { CommissionPolicy } from '../domain/calculator/policies/discounts/commission-policy';
import { HighTurnoverPolicy } from '../domain/calculator/policies/discounts/high-turnover.policy';
import { VIPPolicy } from '../domain/calculator/policies/discounts/vip.policy';
import { TRANSACTION_CLIENT_REPOSITORY } from '../injection-tokens';
import { InMemoryClientRepository } from './transaction-client/in-memory-client-repository';
import { ITransactionClientRepository } from '../domain/transaction-client/transaction-client-repository.interface';
import { DEFAULT_POLICY } from '../domain/calculator/policies/default.policy';

describe('Calculate commission', () => {
  const NON_EUR_EXCHANGE_RATE = 5;
  const CLIENT_ID = 1;

  let useCase: CalculateCommissionUseCase;
  let repo: ITransactionClientRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
          provide: 'RATES_API',
          useValue: new InMemoryRatesExchangeApiService(NON_EUR_EXCHANGE_RATE),
        },
        {
          provide: TRANSACTION_CLIENT_REPOSITORY,
          useClass: InMemoryClientRepository,
        },
        HighTurnoverPolicy,
        VIPPolicy,
      ],
    }).compile();

    useCase = module.get<CalculateCommissionUseCase>(
      CalculateCommissionUseCase,
    );

    repo = module.get<ITransactionClientRepository>(
      TRANSACTION_CLIENT_REPOSITORY,
    );
  });

  const executeUseCase = async ({
    money,
  }: Partial<ICalculateCommissionParams>) =>
    useCase.execute({
      money,
      clientId: CLIENT_ID,
      date: new Date('2020-01-02'),
    });

  describe('base rate', () => {
    const regularClient: ITransactionClient = sampleClient({
      id: CLIENT_ID,
      isVIP: false,
      monthlyTurnover: 100,
    });

    beforeEach(async () => {
      await repo.save(regularClient);
    });

    it('for EUR transactions', async () => {
      const result = await executeUseCase({
        money: Money.of(100, Currency.EUR),
      });

      expect(result).toEqual(Euro.of(250));
      expect(result.equals(Euro.of(0.5))).toBeTruthy();
    });

    it('for non-EUR transactions', async () => {
      const result = await executeUseCase({
        money: Money.of(10000, Currency.USD),
      });

      expect(result).toBeSameMoney(Euro.of(250));
    });
  });

  describe('discount', () => {
    it.each([
      ['EUR', Currency.EUR],
      // ['non-EUR', Currency.USD],
    ])('for clients with a high turnover - %s', async (_scenario, currency) => {
      // given
      const highTurnoverClient: ITransactionClient = sampleClient({
        monthlyTurnover: 10000,
      });

      await repo.save(highTurnoverClient);

      // when
      const result = await executeUseCase({
        money: Money.of(100, currency as Currency),
      });

      // then
      expect(result).toBeSameMoney(Euro.of(0.03));
    });

    it.each([
      ['EUR', Currency.EUR],
      ['non-EUR', Currency.USD],
    ])('for VIP clients - %s', async (_scenario, currency) => {
      // given
      const vipClient: ITransactionClient = sampleClient({
        isVIP: true,
      });

      await repo.save(vipClient);

      // when
      const result = await executeUseCase({
        money: Money.of(100, currency as Currency),
      });

      //
      expect(result).toBeSameMoney(Euro.of(0.05));
    });
  });
});
