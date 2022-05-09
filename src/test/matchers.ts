/* eslint-disable @typescript-eslint/no-namespace */
import { Money } from '../commission/domain/money/Money';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeSameMoney(received: Money): jest.CustomMatcherResult;
    }
  }
}

expect.extend({
  toBeSameMoney(received: Money, expected: Money): jest.CustomMatcherResult {
    const pass: boolean = received.equals(expected);
    const message: () => string = () =>
      pass
        ? ''
        : `Received money (${received.currency} ${received.amount}) is not the same as expected (${expected.currency} ${expected.amount})`;

    return {
      message,
      pass,
    };
  },
});
