import { Euro } from '../money/Euro';
import {
  CommissionPolicy,
  DefaultPolicy,
  ICommissionPolicyParams,
} from './policies/discounts/commission-policy';

export class CommissionCalculator {
  constructor(
    private readonly defaultPolicy: DefaultPolicy,
    private readonly policies: CommissionPolicy[] = [],
  ) {}
  async getCommission(params: ICommissionPolicyParams): Promise<Euro> {
    const allPolicies = [...this.policies, this.defaultPolicy];

    const policyResults = await Promise.all(
      allPolicies.map((p) => p.applyTo(params)),
    );

    const commissions = policyResults.filter(
      (commission) => commission !== null,
    );

    return commissions.sort((a, b) => a.amount - b.amount)[0];
  }
}
