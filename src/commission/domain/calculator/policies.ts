import { Euro } from '../money/Euro';
import { ITransactionClient } from '../transaction-client/ITransactionClient';

export type ClientCommissionPolicy = (
  client: ITransactionClient,
) => Euro | null;

// TODO: name to be consulted with the business
export const VIPCommissionPolicy = (client: ITransactionClient) =>
  client.isVIP ? Euro.of(0.05) : null;

export const HighTurnoverCommissionPolicy = (client: ITransactionClient) =>
  client.monthlyTurnover.amount >= 1000 ? Euro.of(0.03) : null;
