import { Euro } from '../../../domain/money/Euro';

export class CommissionResponseDto {
  constructor(public amount: string, public currency: string) {}

  static fromEUR(euro: Euro) {
    return new CommissionResponseDto(euro.amount.toString(), euro.currency);
  }
}
