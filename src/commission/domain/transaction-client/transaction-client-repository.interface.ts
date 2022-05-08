import { ITransactionClient } from './ITransactionClient';

export interface ITransactionClientRepository {
  getById(clientId: number): Promise<ITransactionClient>;
  save(client: ITransactionClient): Promise<void>;
}
