import { sampleClient } from '../../../test/fixtures';
import { InMemoryClientRepository } from '../../application/transaction-client/in-memory-client-repository';
import { Euro } from '../money/Euro';
import { ITransactionClient } from '../transaction-client/ITransactionClient';
import { CommissionCalculator } from './commission-calculator';
import {
  DefaultPolicy,
  ICommissionPolicyParams,
} from './policies/commission-policy';
import { HighTurnoverPolicy } from './policies/high-turnover.policy';
import { VIPPolicy } from './policies/vip.policy';

const DEFAULT_CLIENT: ITransactionClient = sampleClient({
  isVIP: false,
  monthlyTurnover: 0,
});

const DEFAULT_PARAMS: ICommissionPolicyParams = {
  clientId: 1,
  date: new Date(),
  money: Euro.of(0),
};

const DEFAULT_POLICY: DefaultPolicy = {
  applyTo() {
    return Promise.resolve(Euro.of(0.05));
  },
};

const getParams = (customParams: Partial<ICommissionPolicyParams> = {}) => ({
  ...DEFAULT_PARAMS,
  ...customParams,
});

describe('Commission calculator', () => {
  const clientRepository = new InMemoryClientRepository();

  describe('Base commission', () => {
    const calculator = new CommissionCalculator();

    it.each([
      [100, 0.5],
      [1000, 5],
    ])('returns the default commission of `0.5%`', async (input, output) => {
      const params = getParams({
        money: Euro.of(input),
      });

      expect(await calculator.getCommission(params)).toBeSameMoney(
        Euro.of(output),
      );
    });

    it('does not return a default lower than `0.05€`', async () => {
      const params = getParams({
        money: Euro.of(1000),
      });

      expect(await calculator.getCommission(params)).toBeSameMoney(Euro.of(5));
    });
  });

  describe('Discounts', () => {
    const params = getParams({
      money: Euro.of(10),
    });

    it('returns a set commission of `0.05€` for VIP clients', async () => {
      const calculator = new CommissionCalculator([
        new VIPPolicy(clientRepository),
      ]);

      const vipClient = {
        ...DEFAULT_CLIENT,
        isVIP: true,
      };

      await clientRepository.save(vipClient);

      expect(await calculator.getCommission(params)).toBeSameMoney(
        Euro.of(0.05),
      );
    });

    it.each([1000, 1001])(
      'returns `0.03€` for high turnover clients - `1000.00€` (per month)',
      async (turnover) => {
        const calculator = new CommissionCalculator([
          new HighTurnoverPolicy(clientRepository),
        ]);

        //TODO: just one client type is checked
        const highTurnoverClient = {
          ...DEFAULT_CLIENT,
          monthlyTurnover: Euro.of(turnover),
        };

        await clientRepository.save(highTurnoverClient);

        expect(await calculator.getCommission(params)).toBeSameMoney(
          Euro.of(0.03),
        );
      },
    );

    // TODO: property-based test
    it.each([
      [
        Euro.of(99.9),
        sampleClient({ isVIP: false, monthlyTurnover: 100 }),
        Euro.of(0.5),
      ],
      [
        Euro.of(100),
        sampleClient({ isVIP: false, monthlyTurnover: 100 }),
        Euro.of(0.5),
      ],
      [
        Euro.of(120),
        sampleClient({ isVIP: false, monthlyTurnover: 100 }),
        Euro.of(0.6),
      ],
      [
        Euro.of(1.1),
        sampleClient({ isVIP: false, monthlyTurnover: 100 }),
        Euro.of(0.5),
      ],
      [
        Euro.of(10),
        sampleClient({ isVIP: true, monthlyTurnover: 10001 }),
        Euro.of(0.03),
      ],
      [
        Euro.of(100),
        sampleClient({ isVIP: false, monthlyTurnover: 10000 }),
        Euro.of(0.03),
      ],
      [
        Euro.of(1),
        sampleClient({ isVIP: true, monthlyTurnover: 10 }),
        Euro.of(0.05),
      ],
      [
        Euro.of(1000),
        sampleClient({ isVIP: true, monthlyTurnover: 10 }),
        Euro.of(0.05),
      ],
    ])(
      'given multiple rules, it returns the lowest commission',
      async (input, client, output) => {
        const calculator = new CommissionCalculator([
          new VIPPolicy(clientRepository),
          new HighTurnoverPolicy(clientRepository),
        ]);

        await clientRepository.save(client);

        expect(
          await calculator.getCommission(
            getParams({
              money: input,
            }),
          ),
        ).toBeSameMoney(output);
      },
    );

    it.each([
      [
        [
          new VIPPolicy(clientRepository),
          new HighTurnoverPolicy(clientRepository),
        ],
      ],
      [
        [
          new HighTurnoverPolicy(clientRepository),
          new VIPPolicy(clientRepository),
        ],
      ],
    ])(
      'given multiple rules in any order, it returns the lowest commission',
      async (rules) => {
        // given
        const calculator = new CommissionCalculator(rules);

        const lowestCommission = Euro.of(0.03);

        const lowestCommissionClient = sampleClient({
          isVIP: true,
          monthlyTurnover: 100000,
        });

        await clientRepository.save(lowestCommissionClient);

        // when
        const commission = await calculator.getCommission(
          getParams({
            money: Euro.of(10),
          }),
        );

        // then
        expect(commission).toBeSameMoney(lowestCommission);
      },
    );

    it('given the default rule is the lowest, ignore the discounts', async () => {
      // given
      const lowestCommission = Euro.of(0.01);

      const defaultPolicy: DefaultPolicy = {
        applyTo() {
          return Promise.resolve(lowestCommission);
        },
      };

      const calculator = new CommissionCalculator(
        [
          new HighTurnoverPolicy(clientRepository),
          new VIPPolicy(clientRepository),
        ],
        defaultPolicy,
      );

      // when
      const commission = await calculator.getCommission(
        getParams({
          money: Euro.of(10),
        }),
      );

      // then
      expect(commission).toBeSameMoney(lowestCommission);
    });

    it('Given a discount resulting in 0, then 0 commission should be returned', async () => {
      // given
      const zeroPolicy: DefaultPolicy = {
        applyTo() {
          return Promise.resolve(Euro.of(0));
        },
      };

      const calculator = new CommissionCalculator(
        [
          new HighTurnoverPolicy(clientRepository),
          new VIPPolicy(clientRepository),
          zeroPolicy,
        ],
        DEFAULT_POLICY,
      );

      // when
      const commission = await calculator.getCommission(
        getParams({
          money: Euro.of(10),
        }),
      );

      // then
      expect(commission).toBeSameMoney(Euro.of(0));
    });
  });
});
