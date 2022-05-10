import fc from 'fast-check';

import { sampleClient } from '../../../test/fixtures';
import { Euro } from '../money/Euro';
import { ITransactionClient } from '../transaction-client/ITransactionClient';
import { CommissionCalculator } from './commission-calculator';
import { HighTurnoverCommissionPolicy, VIPCommissionPolicy } from './policies';

const DEFAULT_CLIENT: ITransactionClient = sampleClient({
  isVIP: false,
  monthlyTurnover: 0,
});

describe('Commission calculator', () => {
  describe('Base commission', () => {
    const calculator = new CommissionCalculator([]);

    it.each([
      [100, 0.5],
      [1000, 5],
    ])('returns the default commission of `0.5%`', (input, output) => {
      expect(
        calculator.getCommission(Euro.of(input), DEFAULT_CLIENT),
      ).toBeSameMoney(Euro.of(output));
    });

    it('does not return a default lower than `0.05€`', () => {
      expect(
        calculator.getCommission(Euro.of(1000), DEFAULT_CLIENT),
      ).toBeSameMoney(Euro.of(5));
    });
  });

  describe('Discounts', () => {
    it('returns a set commission of `0.05€` for VIP clients', () => {
      const calculator = new CommissionCalculator([VIPCommissionPolicy]);

      expect(
        calculator.getCommission(Euro.of(10), {
          ...DEFAULT_CLIENT,
          isVIP: true,
        }),
      ).toBeSameMoney(Euro.of(0.05));
    });

    it.each([1000, 1001])(
      'returns `0.03€` for high turnover clients - `1000.00€` (per month)',
      (turnover) => {
        const calculator = new CommissionCalculator([
          HighTurnoverCommissionPolicy,
        ]);

        expect(
          calculator.getCommission(Euro.of(10), {
            ...DEFAULT_CLIENT, //TODO: just one client type is checked
            monthlyTurnover: Euro.of(turnover),
          }),
        ).toBeSameMoney(Euro.of(0.03));
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
      (input, client, output) => {
        const calculator = new CommissionCalculator([
          VIPCommissionPolicy,
          HighTurnoverCommissionPolicy,
        ]);

        expect(calculator.getCommission(input, client)).toBeSameMoney(output);
      },
    );

    it.each([
      [[VIPCommissionPolicy, HighTurnoverCommissionPolicy]],
      [[HighTurnoverCommissionPolicy, VIPCommissionPolicy]],
    ])(
      'given multiple rules in any order, it returns the lowest commission',
      (rules) => {
        const calculator = new CommissionCalculator(rules);

        const lowestCommission = Euro.of(0.03);

        const lowestCommissionClient = sampleClient({
          isVIP: true,
          monthlyTurnover: 100000,
        });

        expect(
          calculator.getCommission(Euro.of(10), lowestCommissionClient),
        ).toBeSameMoney(lowestCommission);
      },
    );
  });
});
