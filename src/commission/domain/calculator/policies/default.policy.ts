import { Euro } from '../../money/Euro';
import { DefaultPolicy } from './discounts/commission-policy';

export const DEFAULT_POLICY: DefaultPolicy = {
  applyTo(params) {
    const baseCommission = (0.5 / 100) * params.money.amount;

    return Promise.resolve(
      Euro.of(baseCommission > 0.5 ? baseCommission : 0.5),
    );
  },
};
