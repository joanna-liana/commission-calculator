import { sampleClient } from '../../../../test/fixtures';
import { Euro } from '../money/Euro';
import { ITransactionClient } from '../transaction-client/ITransactionClient';
import { CommissionCalculator } from './commission-calculator';

const DEFAULT_CLIENT: ITransactionClient = sampleClient({
  isVIP: false,
  monthlyTurnover: 0,
});

describe('Commission calculator', () => {
  const calculator = new CommissionCalculator();

  it.each([
    [100, 0.5],
    [1000, 5],
  ])('returns the default commission of `0.5%`', (input, output) => {
    expect(
      calculator.getCommission(Euro.of(input), DEFAULT_CLIENT),
    ).toStrictEqual(Euro.of(output));
  });

  it('does not return a default lower than `0.05€`', () => {
    expect(
      calculator.getCommission(Euro.of(1000), DEFAULT_CLIENT),
    ).toStrictEqual(Euro.of(5));
  });

  describe('Discounts', () => {
    it('returns a set commission of `0.05€` for VIP clients', () => {
      expect(
        calculator.getCommission(Euro.of(10), {
          ...DEFAULT_CLIENT,
          isVIP: true,
        }),
      ).toStrictEqual(Euro.of(0.05));
    });

    it.each([1000, 1001])(
      'returns `0.03€` for high turnover clients - `1000.00€` (per month)',
      (turnover) => {
        expect(
          calculator.getCommission(Euro.of(10), {
            ...DEFAULT_CLIENT, //TODO: just one client type is checked
            monthlyTurnover: Euro.of(turnover),
          }),
        ).toStrictEqual(Euro.of(0.03));
      },
    );

    // TODO: parametrised test
    it('given multiple rules, it returns the lowest commission', () => {
      expect(
        calculator.getCommission(
          Euro.of(10),
          sampleClient({ isVIP: true, monthlyTurnover: 10001 }),
        ),
      ).toStrictEqual(Euro.of(0.03));

      expect(
        calculator.getCommission(
          Euro.of(100),
          sampleClient({ isVIP: false, monthlyTurnover: 10000 }),
        ),
      ).toStrictEqual(Euro.of(0.03));

      expect(
        calculator.getCommission(
          Euro.of(1),
          sampleClient({ isVIP: true, monthlyTurnover: 10 }),
        ),
      ).toStrictEqual(Euro.of(0.05));

      expect(
        calculator.getCommission(
          Euro.of(1000),
          sampleClient({ isVIP: true, monthlyTurnover: 10 }),
        ),
      ).toStrictEqual(Euro.of(0.05));
    });
  });
});
