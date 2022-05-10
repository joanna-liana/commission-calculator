import { ITransactionClient } from '../transaction-client/ITransactionClient';
import { Euro } from '../money/Euro';
import {
  ClientCommissionPolicy,
  HighTurnoverCommissionPolicy,
  VIPCommissionPolicy,
} from './policies';
import { Optional } from '@nestjs/common';

export class CommissionCalculator {
  constructor(
    @Optional()
    private readonly policies: ClientCommissionPolicy[] = [
      HighTurnoverCommissionPolicy,
      VIPCommissionPolicy,
    ],
  ) {}
  getCommission(money: Euro, client: ITransactionClient): Euro {
    const commissions = this.policies
      .map((p) => p(client))
      .filter((commission) => commission !== null);

    return commissions.length
      ? commissions.sort((a, b) => a.amount - b.amount)[0]
      : this.calculateDefaultCommission(money);
  }

  private calculateDefaultCommission(money: Euro): Euro {
    const baseCommission = (0.5 / 100) * money.amount;

    return Euro.of(baseCommission > 0.5 ? baseCommission : 0.5);
  }
}
