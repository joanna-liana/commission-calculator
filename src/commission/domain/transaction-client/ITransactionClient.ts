import { Euro } from '../money/Euro';

// read model used for various policies/rules
export interface ITransactionClient {
  id: number;
  isVIP: boolean;
  monthlyTurnover?: Euro;
}
