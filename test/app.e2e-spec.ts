import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CommissionRequestDto } from 'src/commission/application/rest/requests/commission-request.dto';
import { Currency } from '../src/commission/domain/money/Currency';
import { TRANSACTION_CLIENT_REPOSITORY } from '../src/commission/injection-tokens';
import { ITransactionClientRepository } from '../src/commission/domain/transaction-client/transaction-client-repository.interface';
import { sampleClient } from './fixtures';

describe('Commission Calculator API', () => {
  const REGULAR_CLIENT_ID = 1;
  const HIGH_TURNOVER_CLIENT_ID = 2;
  const VIP_CLIENT_ID = 42;

  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const repo = app.get<ITransactionClientRepository>(
      TRANSACTION_CLIENT_REPOSITORY,
    );

    await repo.save(
      sampleClient({
        id: REGULAR_CLIENT_ID,
        isVIP: false,
        monthlyTurnover: 100,
      }),
    );
    await repo.save(
      sampleClient({
        id: HIGH_TURNOVER_CLIENT_ID,
        isVIP: false,
        monthlyTurnover: 10000,
      }),
    );
    await repo.save(
      sampleClient({
        id: VIP_CLIENT_ID,
        isVIP: true,
        monthlyTurnover: 100,
      }),
    );

    await app.init();
  });

  function calculateCommission(dto?: Partial<CommissionRequestDto>) {
    return request(app.getHttpServer())
      .post('/commissions')
      .send({
        date: dto?.date ?? '2021-01-01',
        amount: dto?.amount ?? '100.00',
        currency: dto?.currency ?? 'EUR',
        client_id: dto?.client_id ?? REGULAR_CLIENT_ID,
      });
  }

  it('calculates the commission', () => {
    return calculateCommission({
      amount: '100.00',
      currency: Currency.EUR,
    })
      .expect(201)
      .expect({
        // TODO: ask if it's OK to include just 1 decimal place
        amount: '0.5',
        currency: 'EUR',
      });
  });

  it('given a non-Euro currency, it returns the commission in EUR', () => {
    return calculateCommission({
      amount: '100.00',
      currency: Currency.USD,
    })
      .expect(201)
      .expect({
        amount: '5',
        currency: 'EUR',
      });
  });

  // TODO: the most valueable test - a scenario - if there was a way to commit transactions
  it('given a high turnover client, it returns a lower commission', async () => {
    return calculateCommission({
      client_id: HIGH_TURNOVER_CLIENT_ID,
    })
      .expect(201)
      .expect({
        amount: '0.03',
        currency: 'EUR',
      });
  });
});
