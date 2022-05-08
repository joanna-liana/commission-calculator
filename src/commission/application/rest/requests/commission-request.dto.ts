import { Currency } from 'src/commission/domain/money/Currency';

export class CommissionRequestDto {
  // TODO: date validator
  date: Date;
  // TODO: stringified float validator
  amount: string;
  // TODO: currency validator?
  currency: Currency;
  // TODO: client id validator
  client_id: number;
}
