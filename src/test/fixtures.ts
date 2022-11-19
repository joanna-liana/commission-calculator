import { ITransactionClient } from 'src/commission/domain/transaction-client/ITransactionClient';
import { Euro } from '../commission/domain/money/Euro';

export const sampleClient = (
  props: Partial<
    Omit<ITransactionClient, 'monthlyTurnover'> & { monthlyTurnover: number }
  >,
): ITransactionClient => ({
  id: props?.id ?? 1,
  isVIP: props?.isVIP ?? false,
  monthlyTurnover: Euro.of(props?.monthlyTurnover ?? 0),
});
