import { ITransactionClient } from 'src/commission/domain/transaction-client/ITransactionClient';
import { Euro } from '../../domain/money/Euro';
import { ITransactionClientRepository } from '../../domain/transaction-client/transaction-client-repository.interface';

export class InMemoryClientRepository implements ITransactionClientRepository {
  private clients: Record<number, ITransactionClient> = {
    [1]: {
      id: 1,
      isVIP: false,
      monthlyTurnover: Euro.of(100),
    },
    [2]: {
      id: 2,
      isVIP: false,
      monthlyTurnover: Euro.of(10000),
    },
    [42]: {
      id: 42,
      isVIP: true,
      monthlyTurnover: Euro.of(100),
    },
  };

  getById(clientId: number): Promise<ITransactionClient> {
    const client = this.clients[clientId];

    if (!client) {
      throw new Error(`Client ${clientId} does not exist`);
    }

    return Promise.resolve(this.clients[clientId]);
  }

  save(clientToSave: ITransactionClient): Promise<void> {
    const { id } = clientToSave;

    const rawClient = this.clients[id];

    this.clients[id] = rawClient
      ? { ...rawClient, ...clientToSave }
      : clientToSave;

    return Promise.resolve();
  }
}
