import { Euro } from '../money/Euro';
import {
  CommissionPolicy,
  ICommissionPolicyParams,
} from './policies/commission-policy';

export class CommissionCalculator {
  constructor(private readonly policies: CommissionPolicy[] = []) {}
  async getCommission(params: ICommissionPolicyParams): Promise<Euro> {
    const policyResults = await Promise.all(
      this.policies.map((p) => p.applyTo(params)),
    );

    const commissions = policyResults.filter(
      (commission) => commission !== null,
    );

    return commissions.length
      ? commissions.sort((a, b) => a.amount - b.amount)[0]
      : this.calculateDefaultCommission(params.money);
  }

  private calculateDefaultCommission(money: Euro): Euro {
    const baseCommission = (0.5 / 100) * money.amount; /* ? */

    return Euro.of(baseCommission > 0.5 ? baseCommission : 0.5);
  }
}
