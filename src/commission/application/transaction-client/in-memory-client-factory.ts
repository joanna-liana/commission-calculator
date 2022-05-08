import { Inject, Injectable } from '@nestjs/common';
import { ITransactionClient } from 'src/commission/domain/transaction-client/ITransactionClient';
import { ITransactionClientFactory } from 'src/commission/domain/transaction-client/transaction-client-factory.interface';
import { ITransactionClientRepository } from '../../domain/transaction-client/transaction-client-repository.interface';
import { TRANSACTION_CLIENT_REPOSITORY } from '../../injection-tokens';

@Injectable()
export class InMemoryTransactionClientFactory
  implements ITransactionClientFactory
{
  constructor(
    @Inject(TRANSACTION_CLIENT_REPOSITORY)
    private repo: ITransactionClientRepository,
  ) {}

  get(clientId: number): Promise<ITransactionClient> {
    return this.repo.getById(clientId);
  }
}
