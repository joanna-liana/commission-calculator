import { ITransactionClient } from './ITransactionClient';

export interface ITransactionClientFactory {
  get(clientId: number): Promise<ITransactionClient>;
}
