import * as Amount from 'currency.js';

import { Currency } from './Currency';
import { InvalidAmount } from './errors/invalid-amount';
import { UnsupportedCurrency } from './errors/unsupported-currency';

export class Money {
  #amountObject: Amount;
  #currency: Currency;

  protected constructor(amount: Amount, currency: Currency) {
    this.#amountObject = amount;
    this.#currency = currency;
  }

  static of(value: number | string, currency: Currency): Money {
    if (!Object.values(Currency).includes(currency)) {
      throw new UnsupportedCurrency();
    }

    let amount: Amount;

    try {
      amount = Amount(value, {
        precision: 10,
        errorOnInvalid: true,
      });
    } catch (err) {
      throw new InvalidAmount();
    }

    return new Money(amount, currency);
  }

  get amount(): number {
    return this.#amountObject.value;
  }

  get currency(): Currency {
    return this.#currency;
  }
}
