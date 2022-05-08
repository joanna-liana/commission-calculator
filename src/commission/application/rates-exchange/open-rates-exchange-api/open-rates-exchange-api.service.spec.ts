import { Test, TestingModule } from '@nestjs/testing';
import { OpenRatesExchangeApiService } from './open-rates-exchange-api.service';

describe('OpenRatesExchangeApiService', () => {
  let service: OpenRatesExchangeApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenRatesExchangeApiService],
    }).compile();

    service = module.get<OpenRatesExchangeApiService>(
      OpenRatesExchangeApiService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
