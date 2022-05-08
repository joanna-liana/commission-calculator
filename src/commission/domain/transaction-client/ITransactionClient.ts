import { Euro } from '../money/Euro';

export interface ITransactionClient {
  id: number;
  isVIP: boolean;
  monthlyTurnover?: Euro;
}

// TODO: make it a proper aggregate
export class TransactionClient {
  private constructor(public readonly id: number) {}
}
