import { Euro } from '../money/Euro';
import { ITransactionClient } from '../transaction-client/ITransactionClient';

export type ClientCommissionPolicy = (
  client: ITransactionClient,
) => Euro | null;

export const VIPCommissionPolicy = (client: ITransactionClient) =>
  client.isVIP ? Euro.of(0.05) : null;

export const TurnoverCommissionPolicy = (client: ITransactionClient) =>
  client.monthlyTurnover.amount >= 1000 ? Euro.of(0.03) : null;
