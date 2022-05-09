import { Test, TestingModule } from '@nestjs/testing';
import { CommissionCalculator } from '../domain/calculator/commission-calculator';
import {
  CalculateCommissionUseCase,
  ICalculateCommissionParams,
} from './calculate-commission.usecase';
import { InMemoryRatesExchangeApiService } from './rates-exchange/in-memory-rates-exchange-api.service';
import { ITransactionClientFactory } from '../domain/transaction-client/transaction-client-factory.interface';
import { ITransactionClient } from '../domain/transaction-client/ITransactionClient';
import { Money } from '../domain/money/Money';
import { Currency } from '../domain/money/Currency';
import { sampleClient } from '../../test/fixtures';
import { Euro } from '../domain/money/Euro';
import { CommissionPolicy } from '../domain/calculator/policies/commission-policy';
import { HighTurnoverPolicy } from '../domain/calculator/policies/high-turnover.policy';
import { VIPPolicy } from '../domain/calculator/policies/vip.policy';
import { TRANSACTION_CLIENT_REPOSITORY } from '../injection-tokens';
import { InMemoryClientRepository } from './transaction-client/in-memory-client-repository';

describe('Calculate commission', () => {
  const NON_EUR_EXCHANGE_RATE = 5;
  const CLIENT_ID = 123;

  const clientFactoryStub: ITransactionClientFactory = {
    get: jest.fn().mockRejectedValue(null),
  };

  let useCase: CalculateCommissionUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CommissionCalculator,
          useFactory: (
            highTurnoverPolicy: CommissionPolicy,
            vipPolicy: CommissionPolicy,
          ) => {
            return new CommissionCalculator([highTurnoverPolicy, vipPolicy]);
          },
          inject: [HighTurnoverPolicy, VIPPolicy],
        },
        CalculateCommissionUseCase,
        CommissionCalculator,
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
      isVIP: false,
      monthlyTurnover: 100,
    });

    beforeEach(() => {
      clientFactoryStub.get = jest.fn().mockResolvedValue(regularClient);
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

      expect(result).toStrictEqual(Euro.of(250));
    });
  });

  describe('discount', () => {
    it.each([
      ['EUR', Currency.EUR],
      ['non-EUR', Currency.USD],
    ])('for clients with a high turnover - %s', async (_scenario, currency) => {
      // given
      const highTurnoverClient: ITransactionClient = sampleClient({
        monthlyTurnover: 10000,
      });

      clientFactoryStub.get = jest.fn().mockResolvedValue(highTurnoverClient);

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

      clientFactoryStub.get = jest.fn().mockResolvedValue(vipClient);

      // when
      const result = await executeUseCase({
        money: Money.of(100, currency as Currency),
      });

      //
      expect(result).toStrictEqual(Euro.of(0.05));
    });
  });
});
