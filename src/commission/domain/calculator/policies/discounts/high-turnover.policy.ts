import { Inject } from '@nestjs/common';
import { TRANSACTION_CLIENT_REPOSITORY } from '../../../../injection-tokens';
import { Euro } from '../../../money/Euro';
import { ITransactionClientRepository } from '../../../transaction-client/transaction-client-repository.interface';
import { CommissionPolicy, ICommissionPolicyParams } from './commission-policy';

export class HighTurnoverPolicy implements CommissionPolicy {
  // THIS IS A SAMPLE DEPENDENCY
  // could be any source of `monthlyTurnover` data
  constructor(
    @Inject(TRANSACTION_CLIENT_REPOSITORY)
    private readonly clientRepository: ITransactionClientRepository,
  ) {}

  async applyTo(data: ICommissionPolicyParams): Promise<Euro | null> {
    const client = await this.clientRepository.getById(data.clientId);

    return client.monthlyTurnover.amount >= 1000 ? Euro.of(0.03) : null;
  }
}
